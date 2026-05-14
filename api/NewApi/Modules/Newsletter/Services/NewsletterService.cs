using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using API.Common.Email;
using API.Data;
using API.Modules.Catalog.Interfaces;
using API.Modules.Newsletter.Dtos;
using API.Modules.Newsletter.Entities;
using API.Modules.Newsletter.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Modules.Newsletter.Services;

public class NewsletterService : INewsletterService
{
    private readonly DataContext _db;
    private readonly IEmailSender _email;
    private readonly string _baseUrl;

    public NewsletterService(DataContext db, IEmailSender email, IConfiguration config)
    {
        _db = db;
        _email = email;
        _baseUrl = config["Notifications:PublicBaseUrl"] ?? "http://localhost:4200";
    }

    public async Task<bool> SubscribeAsync(NewsletterSubscribeDto dto, string? ipAddress, CancellationToken ct = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var existing = await _db.NewsletterSubscribers.SingleOrDefaultAsync(x => x.Email == email, ct);

        if (existing is not null && existing.IsConfirmed && existing.UnsubscribedAt is null)
        {
            return true;
        }

        var token = NewToken();
        if (existing is null)
        {
            existing = new NewsletterSubscriber
            {
                Email = email,
                Locale = string.IsNullOrWhiteSpace(dto.Locale) ? "en" : dto.Locale.ToLowerInvariant(),
                ConfirmToken = token,
                IpAddress = ipAddress,
                ConsentTimestamp = DateTime.UtcNow
            };
            _db.NewsletterSubscribers.Add(existing);
        }
        else
        {
            existing.Locale = string.IsNullOrWhiteSpace(dto.Locale) ? existing.Locale : dto.Locale.ToLowerInvariant();
            existing.ConfirmToken = token;
            existing.UnsubscribedAt = null;
            existing.IpAddress = ipAddress;
            existing.ConsentTimestamp = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);

        var confirmUrl = $"{_baseUrl.TrimEnd('/')}/newsletter/confirm?token={Uri.EscapeDataString(token)}";
        var html = $@"<p>Hello,</p>
<p>Please confirm your subscription to FreshOrchard newsletter:</p>
<p><a href=""{confirmUrl}"">Confirm subscription</a></p>";
        await _email.SendAsync(new EmailMessage(email, "Confirm your FreshOrchard subscription", html), ct);
        return true;
    }

    public async Task<bool> ConfirmAsync(string token, CancellationToken ct = default)
    {
        var entity = await _db.NewsletterSubscribers.SingleOrDefaultAsync(x => x.ConfirmToken == token, ct);
        if (entity is null) return false;
        entity.IsConfirmed = true;
        entity.ConfirmedAt = DateTime.UtcNow;
        entity.ConfirmToken = null;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> UnsubscribeAsync(string emailOrToken, CancellationToken ct = default)
    {
        var key = emailOrToken.Trim().ToLowerInvariant();
        var entity = await _db.NewsletterSubscribers
            .SingleOrDefaultAsync(x => x.Email == key || x.ConfirmToken == emailOrToken, ct);
        if (entity is null) return false;
        entity.UnsubscribedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<PagedResult<NewsletterSubscriberAdminDto>> ListAdminAsync(NewsletterFilterDto filter, CancellationToken ct = default)
    {
        var query = BuildQuery(filter);
        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 500);

        var items = await query
            .OrderByDescending(x => x.ConsentTimestamp)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => Map(x))
            .ToListAsync(ct);

        return new PagedResult<NewsletterSubscriberAdminDto> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.NewsletterSubscribers.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return false;
        _db.NewsletterSubscribers.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<byte[]> ExportCsvAsync(NewsletterFilterDto filter, CancellationToken ct = default)
    {
        var rows = await BuildQuery(filter)
            .OrderByDescending(x => x.ConsentTimestamp)
            .Select(x => Map(x))
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Id,Email,Locale,IsConfirmed,ConfirmedAt,UnsubscribedAt,ConsentTimestamp,IpAddress");
        foreach (var r in rows)
        {
            sb.Append(r.Id).Append(',')
              .Append(r.Email).Append(',')
              .Append(r.Locale).Append(',')
              .Append(r.IsConfirmed).Append(',')
              .Append(r.ConfirmedAt?.ToString("o", CultureInfo.InvariantCulture) ?? string.Empty).Append(',')
              .Append(r.UnsubscribedAt?.ToString("o", CultureInfo.InvariantCulture) ?? string.Empty).Append(',')
              .Append(r.ConsentTimestamp.ToString("o", CultureInfo.InvariantCulture)).Append(',')
              .Append(r.IpAddress ?? string.Empty)
              .AppendLine();
        }

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    private IQueryable<NewsletterSubscriber> BuildQuery(NewsletterFilterDto filter)
    {
        var query = _db.NewsletterSubscribers.AsNoTracking().Where(x => !x.IsDeleted);
        if (filter.IsConfirmed.HasValue) query = query.Where(x => x.IsConfirmed == filter.IsConfirmed);
        if (filter.IsUnsubscribed.HasValue)
        {
            query = filter.IsUnsubscribed.Value
                ? query.Where(x => x.UnsubscribedAt != null)
                : query.Where(x => x.UnsubscribedAt == null);
        }
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLowerInvariant();
            query = query.Where(x => EF.Functions.Like(x.Email, $"%{s}%"));
        }
        return query;
    }

    private static NewsletterSubscriberAdminDto Map(NewsletterSubscriber x) => new()
    {
        Id = x.Id, Email = x.Email, Locale = x.Locale,
        IsConfirmed = x.IsConfirmed, ConfirmedAt = x.ConfirmedAt,
        UnsubscribedAt = x.UnsubscribedAt, ConsentTimestamp = x.ConsentTimestamp,
        IpAddress = x.IpAddress
    };

    private static string NewToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}
