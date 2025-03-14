/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { useUser } from "@clerk/nextjs"
import { Post } from "@prisma/client"
import { Trash } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createPost, deletePost, getPostsByCompanyEmail } from "../actions"
import EmptyState from "../components/EmptyState"
import Wrapper from "../components/Wrapper"

const page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [newPostName, setNewPostName] = useState("")
  const [loading, setLoading] = useState<boolean>(false)

  const [posts, setPosts] = useState<Post[]>([])

  const fetchPosts = async () => {
    if (email) {
      try {
        const result = await getPostsByCompanyEmail(email)
        if (result) {
          setPosts(result)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleCreatePost = async () => {
    if (!newPostName) return
    setLoading(true)
    try {
      const newPost = await createPost(email, newPostName)
      setLoading(false)
      setNewPostName("")
      fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [email])

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId)
      fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Wrapper>
      <h1 className="text-2xl font-bold mb-4">Liste des posts</h1>
      <div className="flex flex-col md:flex-row">
        <div className="space-y-2 mr-4">
          <input
            type="text"
            placeholder="Nom du post"
            className="input input-bordered input-sm w-full"
            value={newPostName}
            onChange={(e) => setNewPostName(e.target.value)}
          />
          <button
            className="btn btn-accent btn-sm"
            onClick={handleCreatePost}
            disabled={loading}
          >
            {loading ? "Création..." : "Creer le post"}
          </button>
        </div>

        <ul className="mt-4 md:mt-0 w-full grid md:grid-cols-3 gap-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-col bg-base-200 p-5 rounded-lg"
              >
                <div className="lowercase">{post.name}</div>
                <div className="flex items-center mt-2">
                  <Link
                    href={`/post/${post.id}`}
                    className="btn btn-sm btn-accent"
                  >
                    Traiter les tickets
                  </Link>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="btn btn-sm btn-accent btn-outline ml-2"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <div className="flex justify-center items-center w-full col-span-3">
              <EmptyState
                message={"Aucun posts pour le moment"}
                IconComponent="UserRoundCog"
              />
            </div>
          )}
        </ul>
      </div>
    </Wrapper>
  )
}

export default page
