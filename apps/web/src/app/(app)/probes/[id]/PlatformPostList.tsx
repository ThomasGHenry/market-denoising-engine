import React from 'react'
import Link from 'next/link'

interface PlatformPostListProps {
  posts: { id: string; platform: string; url: string | null }[]
}

export default function PlatformPostList({ posts }: PlatformPostListProps) {
  return (
    <ul>
      {posts.map(function (post) {
        return (
          <li key={post.id}>
            <Link href={`/platform-posts/${post.id}`}>{post.platform}</Link>
            {post.url && <a href={post.url} target="_blank" rel="noopener noreferrer">{post.url}</a>}
          </li>
        )
      })}
    </ul>
  )
}
