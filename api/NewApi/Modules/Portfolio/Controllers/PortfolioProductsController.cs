using API.Modules.Portfolio.Dtos;
using API.Modules.Portfolio.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Modules.Portfolio.Controllers;

[ApiController]
[Route("api/v1/products")]
public class PortfolioProductsController : ControllerBase
{
    private readonly DataContext _db;

    public PortfolioProductsController(DataContext db) => _db = db;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAll(CancellationToken ct)
    {
        var products = await _db.ShowcaseProducts
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        return Ok(products.Select(ToDto).ToList());
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] ProductCreateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (!PortfolioConstants.IsValidProductCategory(dto.Category))
        {
            return BadRequest(new { message = "Invalid product category" });
        }

        if (!PortfolioConstants.IsValidContentStatus(dto.Status))
        {
            return BadRequest(new { message = "Invalid product status" });
        }

        var now = DateTimeOffset.UtcNow;
        var product = new ShowcaseProduct
        {
            Name = dto.Name.Trim(),
            NameAr = PortfolioJson.TrimToNull(dto.NameAr),
            Category = PortfolioConstants.NormalizeProductCategory(dto.Category),
            ImageUrl = dto.ImageUrl.Trim(),
            ImageFilter = PortfolioJson.TrimToNull(dto.ImageFilter),
            OriginJson = PortfolioJson.SerializeStringList(dto.Origin),
            VarietiesJson = PortfolioJson.SerializeStringList(dto.Varieties),
            Description = dto.Description.Trim(),
            DescriptionAr = PortfolioJson.TrimToNull(dto.DescriptionAr),
            Note = PortfolioJson.TrimToNull(dto.Note),
            Status = PortfolioConstants.NormalizeContentStatus(dto.Status),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.ShowcaseProducts.Add(product);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetAll), ToDto(product));
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> Update(Guid id, [FromBody] ProductUpdateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var product = await _db.ShowcaseProducts.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return NotFound();

        if (dto.Category is not null)
        {
            if (!PortfolioConstants.IsValidProductCategory(dto.Category))
            {
                return BadRequest(new { message = "Invalid product category" });
            }

            product.Category = PortfolioConstants.NormalizeProductCategory(dto.Category);
        }

        if (dto.Status is not null)
        {
            if (!PortfolioConstants.IsValidContentStatus(dto.Status))
            {
                return BadRequest(new { message = "Invalid product status" });
            }

            product.Status = PortfolioConstants.NormalizeContentStatus(dto.Status);
        }

        if (dto.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { message = "Product name cannot be empty" });
            product.Name = dto.Name.Trim();
        }

        if (dto.ImageUrl is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.ImageUrl)) return BadRequest(new { message = "Image URL cannot be empty" });
            product.ImageUrl = dto.ImageUrl.Trim();
        }

        if (dto.Description is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.Description)) return BadRequest(new { message = "Description cannot be empty" });
            product.Description = dto.Description.Trim();
        }

        if (dto.NameAr is not null) product.NameAr = PortfolioJson.TrimToNull(dto.NameAr);
        if (dto.ImageFilter is not null) product.ImageFilter = PortfolioJson.TrimToNull(dto.ImageFilter);
        if (dto.DescriptionAr is not null) product.DescriptionAr = PortfolioJson.TrimToNull(dto.DescriptionAr);
        if (dto.Note is not null) product.Note = PortfolioJson.TrimToNull(dto.Note);
        if (dto.Origin is not null) product.OriginJson = PortfolioJson.SerializeStringList(dto.Origin);
        if (dto.Varieties is not null) product.VarietiesJson = PortfolioJson.SerializeStringList(dto.Varieties);

        product.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Ok(ToDto(product));
    }

    [Authorize(Roles = "Admin,Editor")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var product = await _db.ShowcaseProducts.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return NotFound();

        _db.ShowcaseProducts.Remove(product);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    private static ProductDto ToDto(ShowcaseProduct product) => new()
    {
        Id = product.Id.ToString(),
        Name = product.Name,
        NameAr = product.NameAr,
        Category = product.Category,
        Origin = PortfolioJson.DeserializeStringList(product.OriginJson),
        Varieties = PortfolioJson.DeserializeStringList(product.VarietiesJson),
        ImageUrl = product.ImageUrl,
        ImageFilter = product.ImageFilter,
        Status = product.Status,
        UpdatedAt = product.UpdatedAt,
        Note = product.Note,
        Description = product.Description,
        DescriptionAr = product.DescriptionAr
    };
}
