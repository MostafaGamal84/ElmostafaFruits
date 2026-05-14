using API.Modules.Catalog.Dtos;
using API.Modules.Catalog.Entities;
using AutoMapper;

namespace API.Common.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Category, CategoryAdminDto>()
            .ForMember(d => d.ProductCount, o => o.MapFrom(s => s.Products.Count(p => !p.IsDeleted)));
        CreateMap<CategoryUpsertDto, Category>();

        CreateMap<Product, ProductAdminDto>()
            .ForMember(d => d.CategorySlug, o => o.MapFrom(s => s.Category != null ? s.Category.Slug : string.Empty));
        CreateMap<ProductUpsertDto, Product>();

        CreateMap<ProductImage, ProductImageDto>();
    }
}
