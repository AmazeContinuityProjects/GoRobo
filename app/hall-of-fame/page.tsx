"use client"

import { useRouter } from "next/navigation"
import { GitFork, Heart, Trophy } from "lucide-react"
import {
  BackButton,
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  IconBadge,
  PageHeader,
  Text,
  View,
} from "@amazecontinuityprojects/amazeui"
import { GITHUB_REPO_URL, HALL_OF_FAME, SITE_NAME } from "@/lib/site"
import { CartButton } from "@/components/cart-button"
import { ResponsiveButton } from "@/components/responsive-button"

export default function HallOfFamePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-2 pb-4 sm:px-6">
          <PageHeader
            icon={
              <IconBadge color="amber" size="md">
                <Trophy className="size-5" aria-hidden="true" />
              </IconBadge>
            }
            title="Hall of Fame"
            meta={
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">
                  {HALL_OF_FAME.length} honoured
                </Badge>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  The giants whose shoulders {SITE_NAME} stands on
                </span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <BackButton onClick={() => router.push("/")} />
                <CartButton />
              </div>
            }
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <View className="flex flex-col gap-4">
          {HALL_OF_FAME.map((entry) => (
            <Card key={entry.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-4 text-sidebar-foreground/40" aria-hidden="true" />
                  {entry.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-sm font-semibold text-muted-foreground">{entry.author}</Text>
                <Text className="mt-1">{entry.description}</Text>
              </CardContent>
              {entry.repo && (
                <CardFooter>
                  <ResponsiveButton
                    icon={<GitFork className="size-4 shrink-0" aria-hidden="true" />}
                    label="View on GitFork"
                    variant="outline"
                    onClick={() => window.open(entry.repo, "_blank", "noopener,noreferrer")}
                  />
                </CardFooter>
              )}
            </Card>
          ))}
        </View>
      </main>
    </div>
  )
}