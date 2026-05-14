using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace API.Common.Recaptcha;

public class RecaptchaOptions
{
    public string? SecretKey { get; set; }
    public double MinimumScore { get; set; } = 0.5;
    public bool Enabled { get; set; }
}

public class GoogleRecaptchaVerifier : IRecaptchaVerifier
{
    private readonly HttpClient _http;
    private readonly RecaptchaOptions _options;
    private readonly ILogger<GoogleRecaptchaVerifier> _logger;

    public GoogleRecaptchaVerifier(HttpClient http, IOptions<RecaptchaOptions> options, ILogger<GoogleRecaptchaVerifier> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken ct = default)
    {
        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.SecretKey)) return true;
        if (string.IsNullOrWhiteSpace(token)) return false;

        try
        {
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("secret", _options.SecretKey!),
                new KeyValuePair<string, string>("response", token!),
                new KeyValuePair<string, string>("remoteip", remoteIp ?? string.Empty)
            });
            var response = await _http.PostAsync("https://www.google.com/recaptcha/api/siteverify", content, ct);
            if (!response.IsSuccessStatusCode) return false;
            var body = await response.Content.ReadFromJsonAsync<RecaptchaResponse>(cancellationToken: ct);
            if (body is null) return false;
            return body.Success && body.Score >= _options.MinimumScore;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "reCAPTCHA verification failed");
            return false;
        }
    }

    private class RecaptchaResponse
    {
        [JsonPropertyName("success")] public bool Success { get; set; }
        [JsonPropertyName("score")] public double Score { get; set; }
        [JsonPropertyName("action")] public string? Action { get; set; }
    }
}
