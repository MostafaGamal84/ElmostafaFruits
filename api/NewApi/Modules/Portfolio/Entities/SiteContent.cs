namespace API.Modules.Portfolio.Entities;

public class SiteContent
{
    public int Id { get; set; } = 1;
    public string Configuration { get; set; } = "{}";
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
