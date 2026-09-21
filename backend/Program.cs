using Markas;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(builder.Configuration["Urls"] ?? "http://127.0.0.1:5080");
builder.Services.AddControllers();
builder.Services.AddDbContext<StoreDb>(o => o.UseSqlite(builder.Configuration.GetConnectionString("Store") ?? "Data Source=store.db"));
builder.Services.AddHttpClient("cloud", c => c.Timeout = TimeSpan.FromSeconds(10));
builder.Services.AddHostedService<SyncWorker>();
var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StoreDb>();
    db.Database.EnsureCreated();
    db.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");
    if (!db.Products.Any() && app.Configuration["Mode"] != "Cloud")
    {
        string[] names = ["Tam Yağlı Süt 1 L", "Köy Yumurtası 10'lu", "Ekşi Mayalı Ekmek", "Natürel Zeytinyağı 1 L", "Domates · kg", "Türk Kahvesi 100 g", "Kaşar Peyniri 500 g", "Maden Suyu 6'lı"];
        string[] categories = ["Süt & Kahvaltı", "Süt & Kahvaltı", "Fırın", "Temel Gıda", "Manav", "İçecek", "Süt & Kahvaltı", "İçecek"];
        long[] prices = [4250, 8990, 6500, 34990, 3990, 7450, 15990, 4990];
        int[] stocks = [48, 8, 24, 16, 6, 42, 9, 64];
        for (int i = 0; i < names.Length; i++) db.Products.Add(new Product { Name = names[i], Barcode = $"86900000000{i + 1:00}", Category = categories[i], PriceCents = prices[i], Stock = stocks[i] });
        db.SaveChanges();
    }
}
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.StartsWithSegments("/api"))
    {
        bool cloud = app.Configuration["Mode"] == "Cloud";
        bool sync = ctx.Request.Path.StartsWithSegments("/api/sync");
        if (cloud != sync && ctx.Request.Path != "/api/health") { ctx.Response.StatusCode = 404; return; }
    }
    try { await next(); }
    catch (DbUpdateConcurrencyException) { ctx.Response.StatusCode = 409; await ctx.Response.WriteAsJsonAsync(new { message = "Kayıt değişti. Yenileyip tekrar deneyin." }); }
    catch (DbUpdateException) { ctx.Response.StatusCode = 409; await ctx.Response.WriteAsJsonAsync(new { message = "Kayıt çakışması. Barkodu veya işlem kimliğini kontrol edin." }); }
});
app.UseDefaultFiles(); app.UseStaticFiles(); app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapFallbackToFile("index.html");
app.Run();
