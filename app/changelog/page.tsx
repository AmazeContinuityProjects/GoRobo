"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GitFork, GitCommit, History, LoaderCircle } from "lucide-react"
import {
  BackButton,
  Badge,
  IconBadge,
  PageHeader,
  Text,
  Timeline,
  TimelineDate,
  TimelineItem,
  TimelineTitle,
  View,
} from "@amazecontinuityprojects/amazeui"
import { ResponsiveButton } from "@/components/responsive-button"
import { CartButton } from "@/components/cart-button"
import {
  CHANGELOG_FALLBACK,
  GITHUB_REPO_URL,
  SITE_NAME,
  SITE_VERSION,
} from "@/lib/site"
import {
  fetchGitHubCommits,
  groupCommitsByDate,
  type CommitGroup,
} from "@/lib/github-changelog"

export default function ChangelogPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<CommitGroup[] | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchGitHubCommits(30).then((commits) => {
      if (cancelled) return
      if (commits && commits.length > 0) {
        setGroups(groupCommitsByDate(commits))
      } else {
        setGroups(
          CHANGELOG_FALLBACK.map((entry) => ({
            date: entry.date,
            commits: [
              {
                sha: "local",
                shortSha: "local",
                message: entry.message,
                cleanMessage: entry.message,
                type: "other",
                authorName: SITE_NAME,
                date: entry.date,
                formattedDate: entry.date,
                url: GITHUB_REPO_URL,
              },
            ],
          })),
        )
        setUsingFallback(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-2 pb-4 sm:px-6">
          <PageHeader
            icon={
              <IconBadge color="indigo" size="md">
                <History className="size-5" aria-hidden="true" />
              </IconBadge>
            }
            title="Changelog"
            meta={
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {SITE_VERSION}
                </Badge>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  What&apos;s new in {SITE_NAME}
                </span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <ResponsiveButton
                  icon={<GitFork className="size-4 shrink-0" aria-hidden="true" />}
                  label="Repository"
                  aria-label="Open the repository on GitHub"
                  variant="outline"
                  onClick={() => window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer")}
                />
                <BackButton onClick={() => router.push("/")} />
                <CartButton />
              </div>
            }
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!groups ? (
          <View className="flex items-center gap-2 py-12 text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            <Text className="text-sm">Loading changelogâ€¦</Text>
          </View>
        ) : (
          <View className="flex flex-col gap-6">
            {usingFallback && (
              <Text className="text-xs text-muted-foreground">
                Showing the local changelog â€” the GitHub history is not available right now.
              </Text>
            )}
            {groups.map((group) => (
              <View key={group.date} className="flex flex-col gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.date}
                </Text>
                <Timeline>
                  {group.commits.map((commit) => (
                    <TimelineItem key={commit.sha} dotColor="emerald">
                      <TimelineTitle className="flex items-center gap-1.5">
                        <GitCommit className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        <button
                          type="button"
                          className="font-mono text-xs text-muted-foreground hover:underline"
                          onClick={() =>
                            window.open(commit.url, "_blank", "noopener,noreferrer")
                          }
                        >
                          #{commit.shortSha}
                        </button>
                      </TimelineTitle>
                      <Text className="text-sm">{commit.cleanMessage}</Text>
                      <TimelineDate>{commit.formattedDate}</TimelineDate>
                    </TimelineItem>
                  ))}
                </Timeline>
              </View>
            ))}
          </View>
        )}
      </main>
    </div>
  )
}