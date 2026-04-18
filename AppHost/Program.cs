var builder = DistributedApplication.CreateBuilder(args);

var backend = builder.AddProject<Projects.Backend>("backend");

builder.AddNpmApp("frontend", "../frontend")
       .WithReference(backend)
       .WithEnvironment("BROWSER", "none")
       .WithHttpEndpoint(env: "PORT")
       .WaitFor(backend);

builder.Build().Run();
