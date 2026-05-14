using System.Globalization;
using System.Text;
using API.Common.Email;
using API.Data;
using API.Modules.Catalog.Interfaces;
using API.Modules.Leads.Dtos;
using API.Modules.Leads.Entities;
using API.Modules.Leads.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Modules.Leads.Services;

public class QuoteRequestService : IQuoteRequestService
{
    private readonly DataContext _db;
    private readonly IEmailSender _email;
    private readonly string _adminEmail;

    public QuoteRequestService(DataContext db, IEmailSender email, IConfiguration config)
    {
        _db = db;
        _email = email;
        _adminEmail = config["Notifications:AdminEmail"] ?? "admin@freshorchard.local";
    }

    public async Task<int> SubmitAsync(QuoteRequestPublicSubmitDto dto, string? ipAddress, CancellationToken ct = default)
    {
        var entity = new QuoteRequest
        {
            FullName = dto.FullName.Trim(),
            Company = dto.Company.Trim(),
            Country = dto.Country.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = dto.Phone?.Trim(),
            Quantity = dto.Quantity?.Trim(),
            ProductId = dto.ProductId,
            Message = dto.Message?.Trim(),
            AttachmentUrl = dto.AttachmentUrl?.Trim(),
            Locale = string.IsNullOrWhiteSpace(dto.Locale) ? "en" : dto.Locale.ToLowerInvariant(),
            IpAddress = ipAddress,
            Status = QuoteRequestStatus.New
        };

        _db.QuoteRequests.Add(entity);
        await _db.SaveChangesAsync(ct);

        await NotifyAdminAsync(entity, ct);
        await NotifyCustomerAsync(entity, ct);

        return entity.Id;
    }

    public async Task<PagedResult<QuoteRequestAdminDto>> ListAdminAsync(QuoteRequestFilterDto filter, CancellationToken ct = default)
    {
        var query = BuildQuery(filter);
        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 200);

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => MapAdmin(x))
            .ToListAsync(ct);

        return new PagedResult<QuoteRequestAdminDto> { Items = items, Total = total, Page = page, PageSize = pageSize };
    }

    public async Task<QuoteRequestAdminDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var x = await _db.QuoteRequests
            .AsNoTracking()
            .Include(q => q.Product)
            .SingleOrDefaultAsync(q => q.Id == id && !q.IsDeleted, ct);
        return x is null ? null : MapAdmin(x);
    }

    public async Task<bool> UpdateStatusAsync(int id, QuoteRequestStatus status, CancellationToken ct = default)
    {
        var entity = await _db.QuoteRequests.SingleOrDefaultAsync(q => q.Id == id && !q.IsDeleted, ct);
        if (entity is null) return false;
        entity.Status = status;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.QuoteRequests.SingleOrDefaultAsync(q => q.Id == id, ct);
        if (entity is null) return false;
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<byte[]> ExportCsvAsync(QuoteRequestFilterDto filter, CancellationToken ct = default)
    {
        var rows = await BuildQuery(filter)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => MapAdmin(x))
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Id,CreatedAt,Status,FullName,Company,Country,Email,Phone,Quantity,ProductSlug,Locale,Message");
        foreach (var r in rows)
        {
            sb.Append(r.Id).Append(',')
              .Append(r.CreatedAt.ToString("o", CultureInfo.InvariantCulture)).Append(',')
              .Append(r.Status).Append(',')
              .Append(Csv(r.FullName)).Append(',')
              .Append(Csv(r.Company)).Append(',')
              .Append(Csv(r.Country)).Append(',')
              .Append(Csv(r.Email)).Append(',')
              .Append(Csv(r.Phone ?? string.Empty)).Append(',')
              .Append(Csv(r.Quantity ?? string.Empty)).Append(',')
              .Append(Csv(r.ProductSlug ?? string.Empty)).Append(',')
              .Append(Csv(r.Locale)).Append(',')
              .Append(Csv(r.Message ?? string.Empty))
              .AppendLine();
        }

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    private IQueryable<QuoteRequest> BuildQuery(QuoteRequestFilterDto filter)
    {
        var query = _db.QuoteRequests
            .AsNoTracking()
            .Include(q => q.Product)
            .Where(q => !q.IsDeleted);

        if (filter.Status.HasValue) query = query.Where(q => q.Status == filter.Status);
        if (filter.From.HasValue) query = query.Where(q => q.CreatedAt >= filter.From);
        if (filter.To.HasValue) query = query.Where(q => q.CreatedAt <= filter.To);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim();
            query = query.Where(q =>
                EF.Functions.Like(q.Email, $"%{s}%") ||
                EF.Functions.Like(q.FullName, $"%{s}%") ||
                EF.Functions.Like(q.Company, $"%{s}%") ||
                EF.Functions.Like(q.Country, $"%{s}%") ||
                (q.Phone != null && EF.Functions.Like(q.Phone, $"%{s}%")) ||
                (q.Quantity != null && EF.Functions.Like(q.Quantity, $"%{s}%")) ||
                EF.Functions.Like(q.Locale, $"%{s}%") ||
                (q.Product != null && EF.Functions.Like(q.Product.Slug!, $"%{s}%")));
        }
        return query;
    }

    private static QuoteRequestAdminDto MapAdmin(QuoteRequest x) => new()
    {
        Id = x.Id,
        FullName = x.FullName,
        Company = x.Company,
        Country = x.Country,
        Email = x.Email,
        Phone = x.Phone,
        Quantity = x.Quantity,
        ProductId = x.ProductId,
        ProductSlug = x.Product?.Slug,
        Message = x.Message,
        AttachmentUrl = x.AttachmentUrl,
        Locale = x.Locale,
        IpAddress = x.IpAddress,
        Status = x.Status,
        CreatedAt = x.CreatedAt
    };

    private async Task NotifyAdminAsync(QuoteRequest entity, CancellationToken ct)
    {
        var company = System.Net.WebUtility.HtmlEncode(entity.Company);
        var country = System.Net.WebUtility.HtmlEncode(entity.Country);
        var email = System.Net.WebUtility.HtmlEncode(entity.Email);
        var phone = System.Net.WebUtility.HtmlEncode(entity.Phone ?? "Not provided");
        var quantity = System.Net.WebUtility.HtmlEncode(entity.Quantity ?? "Not provided");
        var locale = System.Net.WebUtility.HtmlEncode(entity.Locale);
        var message = System.Net.WebUtility.HtmlEncode(entity.Message ?? "No message provided.");
        var createdAt = entity.CreatedAt.ToString("yyyy-MM-dd HH:mm 'UTC'", CultureInfo.InvariantCulture);
        var product = entity.ProductId?.ToString(CultureInfo.InvariantCulture) ?? "General inquiry";

        var html = $@"
<div style=""font-family:Segoe UI,Arial,sans-serif;line-height:1.7;color:#1f1f1f"">
  <h2 style=""margin:0 0 16px;color:#f57c00"">New El Mostafa quote request #{entity.Id}</h2>
  <p style=""margin:0 0 14px"">A new pricing inquiry has been submitted from the public website.</p>
  <table style=""width:100%;border-collapse:collapse"">
    <tr><td style=""padding:8px 0;font-weight:700"">Name</td><td style=""padding:8px 0"">{System.Net.WebUtility.HtmlEncode(entity.FullName)}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Company</td><td style=""padding:8px 0"">{company}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Country</td><td style=""padding:8px 0"">{country}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Email</td><td style=""padding:8px 0"">{email}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Phone</td><td style=""padding:8px 0"">{phone}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Quantity</td><td style=""padding:8px 0"">{quantity}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Product</td><td style=""padding:8px 0"">{product}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Locale</td><td style=""padding:8px 0"">{locale}</td></tr>
    <tr><td style=""padding:8px 0;font-weight:700"">Received</td><td style=""padding:8px 0"">{createdAt}</td></tr>
  </table>
  <div style=""margin-top:18px;padding:14px 16px;border-radius:12px;background:#f7f7f7"">
    <div style=""font-weight:700;margin-bottom:8px"">Customer message</div>
    <div>{message}</div>
  </div>
</div>";

        await _email.SendAsync(new EmailMessage(_adminEmail, $"El Mostafa quote #{entity.Id}", html, entity.Email), ct);
    }

    private async Task NotifyCustomerAsync(QuoteRequest entity, CancellationToken ct)
    {
        var customerName = System.Net.WebUtility.HtmlEncode(entity.FullName);
        var isArabic = string.Equals(entity.Locale, "ar", StringComparison.OrdinalIgnoreCase);
        var subject = isArabic ? "تم استلام طلب عرض السعر" : "We received your quote request";
        var html = isArabic
            ? $@"
<div style=""font-family:Segoe UI,Arial,sans-serif;line-height:1.9;color:#1f1f1f;direction:rtl;text-align:right"">
  <p>الأستاذ/ة {customerName}،</p>
  <p>شكرًا لتواصلك مع <strong>El Mostafa</strong>. تم استلام طلب عرض السعر الخاص بك برقم <strong>#{entity.Id}</strong> وسيقوم فريقنا بالتواصل معك في أقرب وقت.</p>
  <p>مع أطيب التحيات،<br/>فريق El Mostafa</p>
</div>"
            : $@"
<div style=""font-family:Segoe UI,Arial,sans-serif;line-height:1.8;color:#1f1f1f"">
  <p>Dear {customerName},</p>
  <p>Thank you for contacting <strong>El Mostafa</strong>. Your quote request (reference <strong>#{entity.Id}</strong>) has been received and our team will reply shortly.</p>
  <p>Best regards,<br/>El Mostafa Team</p>
</div>";

        await _email.SendAsync(new EmailMessage(entity.Email, subject, html), ct);
    }

    private static string Csv(string value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        var needsQuotes = value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r');
        var escaped = value.Replace("\"", "\"\"");
        return needsQuotes ? $"\"{escaped}\"" : escaped;
    }
}
