export function isGitHubUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "github.com"
    );
  } catch {
    return false;
  }
}
