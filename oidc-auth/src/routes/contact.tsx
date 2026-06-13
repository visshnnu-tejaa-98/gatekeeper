import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { MarketingLayout } from '@/components/shell/MarketingLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input, Field, Textarea } from '@/components/ui/Input'
import { Github, Mail, MessageCircle, CheckCircle2, ArrowUpRight, User } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/contact')({ component: ContactPage })

type ContactForm = { name: string; email: string; message: string }

function ContactPage() {
  const [sent, setSent] = React.useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>()

  const onSubmit: SubmitHandler<ContactForm> = async () => {
    await new Promise((r) => setTimeout(r, 700))
    setSent(true)
    toast.success('Message sent — we\'ll be in touch')
  }

  return (
    <MarketingLayout bg="grid-only">
      <section className="px-6 pt-20 pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-3">
            Contact
          </p>
          <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white leading-[1.05] mb-4">
            Let's talk.
          </h1>
          <p className="text-[16px] text-white/55 leading-relaxed">
            Questions, feedback, security disclosures, or partnership ideas — pick a channel.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Form */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Send a message</CardTitle>
                <CardDescription>Typical response within 24 hours.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              {sent ? (
                <div className="text-center py-8">
                  <div className="size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-[15px] font-semibold text-white mb-1">Message received</p>
                  <p className="text-[13px] text-white/50">
                    We'll get back to you at the email you provided.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Your name" error={errors.name?.message}>
                      <Input
                        icon={User}
                        placeholder="Jane Doe"
                        {...register('name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
                        error={!!errors.name}
                      />
                    </Field>
                    <Field label="Email" error={errors.email?.message}>
                      <Input
                        icon={Mail}
                        type="email"
                        placeholder="you@example.com"
                        {...register('email', {
                          required: 'Required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                        })}
                        error={!!errors.email}
                      />
                    </Field>
                  </div>
                  <Field label="How can we help?" error={errors.message?.message}>
                    <Textarea
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      {...register('message', { required: 'Required', minLength: { value: 10, message: 'A bit more detail please' } })}
                      error={!!errors.message}
                    />
                  </Field>
                  <Button type="submit" variant="primary" block size="lg" loading={isSubmitting}>
                    Send message <ArrowUpRight className="size-4" />
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          {/* Channels */}
          <div className="flex flex-col gap-3">
            <ChannelCard
              icon={Github}
              title="GitHub"
              desc="Bugs, features, contributions"
              href="https://github.com"
            />
            <ChannelCard
              icon={Mail}
              title="Email"
              desc="hello@ilogin.dev"
              href="mailto:hello@ilogin.dev"
            />
            <ChannelCard
              icon={MessageCircle}
              title="Discord"
              desc="Community chat & support"
              href="#"
            />
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

function ChannelCard({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: any
  title: string
  desc: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group p-4 rounded-lg border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/16 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center">
          <Icon className="size-4 text-violet-300" />
        </div>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold text-white">{title}</p>
          <p className="text-[12px] text-white/45">{desc}</p>
        </div>
        <ArrowUpRight className="size-4 text-white/35 group-hover:text-white/70 transition-colors" />
      </div>
    </a>
  )
}
