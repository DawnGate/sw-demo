self.addEventListener("fetch", function (event) {
  console.log(event);
  // it intercept in post message and return file with response object
  if (event.request.url.indexOf("download-file") !== -1) {
    event.respondWith(
      event.request.formData().then(function (formdata) {
        var filename = formdata.get("filename");
        var body = formdata.get("filebody");
        var response = new Response(body);
        response.headers.append(
          "Content-Disposition",
          'attachment; filename="' + filename + '"'
        );
        return response;
      })
    );
  }
});

self.addEventListener("install", function () {
  console.log("sw installed");
});
