/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '/ceylonwoodcreations';

const nextConfig = {
  output: 'export',
  basePath: isGithubActions ? (process.env.CUSTOM_DOMAIN ? '' : repoName) : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
