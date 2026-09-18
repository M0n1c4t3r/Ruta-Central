export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.href, 308);
    }
    // This binding contains only the generated public artifact, never the repo.
    return env.ASSETS.fetch(request);
  },
};
