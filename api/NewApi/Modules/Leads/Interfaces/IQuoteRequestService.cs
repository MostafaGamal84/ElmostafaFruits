using API.Modules.Catalog.Interfaces;
using API.Modules.Leads.Dtos;
using API.Modules.Leads.Entities;

namespace API.Modules.Leads.Interfaces;

public interface IQuoteRequestService
{
    Task<int> SubmitAsync(QuoteRequestPublicSubmitDto dto, string? ipAddress, CancellationToken ct = default);

    Task<PagedResult<QuoteRequestAdminDto>> ListAdminAsync(QuoteRequestFilterDto filter, CancellationToken ct = default);
    Task<QuoteRequestAdminDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> UpdateStatusAsync(int id, QuoteRequestStatus status, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<byte[]> ExportCsvAsync(QuoteRequestFilterDto filter, CancellationToken ct = default);
}
