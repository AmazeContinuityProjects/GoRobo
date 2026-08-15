"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { GitFork, Sparkles, Trophy, History } from "lucide-react"
import {
  AboutSection,
  BackButton,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  IconBadge,
  PageHeader,
  Text,
  View,
} from "@amazecontinuityprojects/amazeui"
import { ResponsiveButton } from "@/components/responsive-button"
import { CartButton } from "@/components/cart-button"
import {
  AMAZE_CP_NAME,
  AMAZE_CP_TAGLINE,
  GITHUB_REPO_URL,
  SITE_NAME,
  SITE_PLATFORM,
  SITE_TAGLINE,
  SITE_VERSION,
  SITE_LAST_UPDATED,
} from "@/lib/site"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-2 pb-4 sm:px-6">
          <PageHeader
            icon={
              <IconBadge color="emerald" size="md">
                <Sparkles className="size-5" aria-hidden="true" />
              </IconBadge>
            }
            title="About"
            meta={
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                  {SITE_VERSION}
                </Badge>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  About {SITE_NAME}
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
        <View className="flex flex-col gap-6">
          <AboutSection
            wordmarkLightSrc="/images/icons/wordmarkLight.svg"
            wordmarkDarkSrc="/images/icons/wordmarkDark.svg"
            tagline={SITE_TAGLINE}
            version={SITE_VERSION}
            buildNumber="2026.08"
            lastUpdated={SITE_LAST_UPDATED}
            platform={SITE_PLATFORM}
          />

          <Card>
            <CardHeader>
              <CardTitle>Made possible by {AMAZE_CP_NAME}</CardTitle>
              <CardDescription>{AMAZE_CP_TAGLINE}</CardDescription>
            </CardHeader>
            <CardContent>
              <Text>
                {SITE_NAME} is proudly supported by <span className="font-semibold">{AMAZE_CP_NAME}</span>, the
                organisation that builds and maintains the amazeui design system this site is built on. Their
                support covers the software, tooling and maintenance that keep this catalog running &mdash; so the
                store can stay open source, free to use, and free to improve.
              </Text>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-3">
              <ResponsiveButton
                icon={<GitFork className="size-4 shrink-0" aria-hidden="true" />}
                label="View the source on GitHub"
                onClick={() => window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer")}
              />
              <Link href="/hall-of-fame">
                <ResponsiveButton
                  icon={<Trophy className="size-4 shrink-0" aria-hidden="true" />}
                  label="Hall of Fame"
                  variant="outline"
                />
              </Link>
              <Link href="/changelog">
                <ResponsiveButton
                  icon={<History className="size-4 shrink-0" aria-hidden="true" />}
                  label="Changelog"
                  variant="outline"
                />
              </Link>
            </CardFooter>
          </Card>
        </View>
      </main>
    </div>
  )
}