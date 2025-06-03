/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'vtjgzrqjqscktkuajuqk.supabase.co',
                pathname: '/**',
            },
        ],
    },
}

export default nextConfig
