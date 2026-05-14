using API.Modules.Portfolio.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Portfolio.Controllers;

[ApiController]
[Route("api/v1/origins")]
public class OriginsController : ControllerBase
{
    private readonly DataContext _db;

    public OriginsController(DataContext db) => _db = db;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<OriginDto>>> GetAll(CancellationToken ct)
    {
        var origins = await _db.Origins
            .AsNoTracking()
            .OrderBy(x => x.Country)
            .ToListAsync(ct);

        var productsLookup = await BuildProductsLookupAsync(ct);

        return Ok(origins.Select(origin => ToDto(origin, GetProductsForOrigin(productsLookup, origin.Country))).ToList());
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<OriginDto>> Create([FromBody] OriginCreateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var id = dto.Id.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { message = "Origin id is required" });
        }

        var exists = await _db.Origins.AnyAsync(x => x.Id == id, ct);
        if (exists)
        {
            return Conflict(new { message = "Origin already exists" });
        }

        var now = DateTimeOffset.UtcNow;
        var origin = new Entities.Origin
        {
            Id = id,
            Flag = id,
            Country = dto.Country.Trim(),
            CountryAr = PortfolioJson.TrimToNull(dto.CountryAr),
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Focus = null,
            FeaturedItems = 0,
            Status = PortfolioConstants.NormalizeContentStatus("Active"),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Origins.Add(origin);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetAll), ToDto(origin, []));
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id}")]
    public async Task<ActionResult<OriginDto>> Update(string id, [FromBody] OriginUpdateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var origin = await _db.Origins.SingleOrDefaultAsync(x => x.Id == id.ToUpperInvariant(), ct);
        if (origin is null) return NotFound();

        if (dto.Country is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.Country)) return BadRequest(new { message = "Country cannot be empty" });
            origin.Country = dto.Country.Trim();
        }

        origin.CountryAr = PortfolioJson.TrimToNull(dto.CountryAr);
        origin.Latitude = dto.Latitude;
        origin.Longitude = dto.Longitude;

        origin.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        var productsLookup = await BuildProductsLookupAsync(ct);
        return Ok(ToDto(origin, GetProductsForOrigin(productsLookup, origin.Country)));
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var origin = await _db.Origins.SingleOrDefaultAsync(x => x.Id == id.ToUpperInvariant(), ct);
        if (origin is null) return NotFound();

        _db.Origins.Remove(origin);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    private async Task<Dictionary<string, List<string>>> BuildProductsLookupAsync(CancellationToken ct)
    {
        var showcaseProducts = await _db.ShowcaseProducts
            .AsNoTracking()
            .Select(product => new { product.Name, product.OriginJson })
            .ToListAsync(ct);

        var lookup = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var product in showcaseProducts)
        {
            foreach (var originName in PortfolioJson.DeserializeStringList(product.OriginJson))
            {
                var normalizedOriginName = originName.Trim();
                if (string.IsNullOrWhiteSpace(normalizedOriginName))
                {
                    continue;
                }

                if (!lookup.TryGetValue(normalizedOriginName, out var productNames))
                {
                    productNames = [];
                    lookup[normalizedOriginName] = productNames;
                }

                if (!productNames.Contains(product.Name, StringComparer.OrdinalIgnoreCase))
                {
                    productNames.Add(product.Name);
                }
            }
        }

        return lookup;
    }

    private static List<string> GetProductsForOrigin(
        IReadOnlyDictionary<string, List<string>> productsLookup,
        string country)
    {
        return productsLookup.TryGetValue(country, out var products)
            ? products
            : [];
    }

    private static OriginDto ToDto(Entities.Origin origin, List<string> products) => new()
    {
        Id = origin.Id,
        Flag = origin.Flag,
        Country = origin.Country,
        CountryAr = origin.CountryAr,
        Latitude = origin.Latitude,
        Longitude = origin.Longitude,
        Products = products
    };
}
