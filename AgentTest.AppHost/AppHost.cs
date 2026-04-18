var builder = DistributedApplication.CreateBuilder(args);

var server = builder.AddProject<Projects.AgentTest_Server>("server")
    .WithExternalHttpEndpoints();

if (builder.Environment.EnvironmentName == "Development")
{
    server = server.WithHttpHealthCheck("/health");
}

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
