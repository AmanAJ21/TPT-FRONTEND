"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Heart,
  ExternalLink,
  ArrowUp
} from "lucide-react"

interface MobileFooterProps extends React.HTMLAttributes<HTMLElement> {
  companyName?: string
  description?: string
  links?: {
    title: string
    items: Array<{
      label: string
      href: string
      external?: boolean
    }>
  }[]
  contact?: {
    email?: string
    phone?: string
    address?: string
  }
  social?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    github?: string
  }
  showBackToTop?: boolean
}

const MobileFooter = React.forwardRef<HTMLElement, MobileFooterProps>(
  ({ 
    className, 
    companyName = "Transport Manager",
    description = "Comprehensive transport and logistics management platform",
    links = [],
    contact,
    social,
    showBackToTop = true,
    ...props 
  }, ref) => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
      <footer
        ref={ref}
        className={cn(
          "bg-background border-t mt-auto",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {companyName}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
              
              {/* Social links */}
              {social && (
                <div className="flex items-center gap-3">
                  {social.facebook && (
                    <Link
                      href={social.facebook}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </Link>
                  )}
                  {social.twitter && (
                    <Link
                      href={social.twitter}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </Link>
                  )}
                  {social.instagram && (
                    <Link
                      href={social.instagram}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </Link>
                  )}
                  {social.linkedin && (
                    <Link
                      href={social.linkedin}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  )}
                  {social.github && (
                    <Link
                      href={social.github}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Link sections */}
            {links.map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {item.label}
                        {item.external && <ExternalLink className="h-3 w-3" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact info */}
            {contact && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Contact
                </h4>
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Link
                        href={`mailto:${contact.email}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {contact.email}
                      </Link>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Link
                        href={`tel:${contact.phone}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {contact.phone}
                      </Link>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {contact.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} {companyName}. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>in India</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              
              {showBackToTop && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Back to top</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    )
  }
)
MobileFooter.displayName = "MobileFooter"

// Predefined footer configurations
const defaultLinks = [
  {
    title: "Product",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Reports", href: "/reports" },
      { label: "Analysis", href: "/analysis" },
      { label: "Entry Management", href: "/entry" },
    ]
  },
  {
    title: "Support",
    items: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Documentation", href: "/docs", external: true },
      { label: "API Reference", href: "/api-docs", external: true },
    ]
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Press Kit", href: "/press" },
    ]
  }
]

const defaultContact = {
  email: "support@transportmanager.com",
  phone: "+91 98765 43210",
  address: "123 Business District, Mumbai, Maharashtra 400001"
}

const defaultSocial = {
  twitter: "https://twitter.com/transportmgr",
  linkedin: "https://linkedin.com/company/transport-manager",
  github: "https://github.com/transport-manager"
}

// Pre-configured footer variants
const SimpleFooter = React.forwardRef<HTMLElement, Omit<MobileFooterProps, 'links' | 'contact' | 'social'>>(
  (props, ref) => (
    <MobileFooter
      ref={ref}
      {...props}
    />
  )
)
SimpleFooter.displayName = "SimpleFooter"

const CompleteFooter = React.forwardRef<HTMLElement, Omit<MobileFooterProps, 'links' | 'contact' | 'social'>>(
  (props, ref) => (
    <MobileFooter
      ref={ref}
      links={defaultLinks}
      contact={defaultContact}
      social={defaultSocial}
      {...props}
    />
  )
)
CompleteFooter.displayName = "CompleteFooter"

export {
  MobileFooter,
  SimpleFooter,
  CompleteFooter,
  defaultLinks,
  defaultContact,
  defaultSocial,
}