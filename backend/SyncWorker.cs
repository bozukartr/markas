using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
namespace Markas;

public class SyncWorker(IServiceScopeFactory scopes, IHttpClientFactory clients, IConfiguration config, ILogger<SyncWorker> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stop)
    {
        int failures = 0;
        while (!stop.IsCancellationRequested)
        {
            try
            {
                var url = config["Cloud:Url"]; var key = config["Cloud:ApiKey"];
                if (config["Mode"] != "Cloud" && !string.IsNullOrWhiteSpace(url) && !string.IsNullOrWhiteSpace(key))
                {
                    using var scope = scopes.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<StoreDb>();
                    var pending = await db.Sales.Where(s => !s.Synced).OrderBy(s => s.CreatedAt).Take(50).ToListAsync(stop);
                    foreach (var sale in pending)
                    {
                        using var req = new HttpRequestMessage(HttpMethod.Post, url.TrimEnd('/') + "/api/sync") { Content = JsonContent.Create(sale) };
                        req.Headers.Add("X-Sync-Key", key);
                        using var response = await clients.CreateClient("cloud").SendAsync(req, stop);
                        response.EnsureSuccessStatusCode();
                        // If we crash before this acknowledgement, the cloud deduplicates the retry.
                        sale.Synced = true; await db.SaveChangesAsync(stop);
                    }
                }
                failures = 0;
            }
            catch (OperationCanceledException) when (stop.IsCancellationRequested) { break; }
            catch (Exception e) { failures = Math.Min(failures + 1, 5); log.LogWarning("Bulut gönderimi bekliyor: {Error}", e.Message); }
            try { await Task.Delay(TimeSpan.FromSeconds(Math.Min(60, 2 * Math.Pow(2, failures))), stop); } catch (OperationCanceledException) { break; }
        }
    }
}
