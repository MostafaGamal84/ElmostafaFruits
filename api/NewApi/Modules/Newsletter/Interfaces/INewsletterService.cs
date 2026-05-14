using API.Modules.Catalog.Interfaces;
using API.Modules.Newsletter.Dtos;

namespace API.Modules.Newsletter.Interfaces;

public interface INewsletterService
{
    Task<bool> SubscribeAsync(NewsletterSubscribeDto dto, string? ipAddress, CancellationToken ct = default);
    Task<bool> ConfirmAsync(string token, CancellationToken ct = default);
    Task<bool> UnsubscribeAsync(string emailOrToken, CancellationToken ct = default);

    Task<PagedResult<NewsletterSubscriberAdminDto>> ListAdminAsync(NewsletterFilterDto filter, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<byte[]> ExportCsvAsync(NewsletterFilterDto filter, CancellationToken ct = default);
}
