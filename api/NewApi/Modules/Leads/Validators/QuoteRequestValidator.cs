using API.Modules.Leads.Dtos;
using FluentValidation;

namespace API.Modules.Leads.Validators;

public class QuoteRequestPublicSubmitValidator : AbstractValidator<QuoteRequestPublicSubmitDto>
{
    public QuoteRequestPublicSubmitValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Company).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(40);
        RuleFor(x => x.Quantity).MaximumLength(80);
        RuleFor(x => x.Message).MaximumLength(4000);
        RuleFor(x => x.Locale).MaximumLength(8);
    }
}
