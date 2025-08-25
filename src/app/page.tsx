"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from '@/components/comp-577'
import Footer from '@/components/footer'
import {
  Truck,
  BarChart3,
  FileText,
  PieChart,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Smartphone,
  CheckCircle,
  Users,
  Globe,
  Zap,
  Award,
  MapPin
} from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: Truck,
      title: "Transport Management",
      description: "Complete vehicle and route management with real-time tracking",
      href: "/entry",
      color: "bg-blue-500"
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Advanced insights and performance metrics for your business",
      href: "/analysis",
      color: "bg-green-500"
    },
    {
      icon: FileText,
      title: "Smart Reports",
      description: "Generate detailed reports with filtering and export options",
      href: "/reports",
      color: "bg-purple-500"
    },
    {
      icon: PieChart,
      title: "Dashboard Overview",
      description: "Real-time business overview with key performance indicators",
      href: "/dashboard",
      color: "bg-orange-500"
    }
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Optimize routes and reduce operational costs by up to 30%"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Automate paperwork and reduce manual entry by 80%"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Access your business data anywhere with our mobile-optimized platform"
    }
  ]



  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Star className="h-4 w-4 mr-2 fill-current" />
                Transport Management Platform
              </Badge>
            </div>

            {/* Enhanced Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Transform Your{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  Transport Business
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
              </span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Complete transport management solution with real-time tracking,
              automated billing, and powerful analytics to{" "}
              <span className="text-primary font-semibold">grow your business faster</span>.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Link href="/signup">
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Manage Transport
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed specifically for transport businesses in India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-background/80 backdrop-blur-sm hover:-translate-y-2 relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="pb-4 relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Button asChild variant="ghost" className="p-0 h-auto font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    <Link href={feature.href} className="inline-flex items-center">
                      Explore Feature
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-28 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Join{" "}

              Growing with Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your transport operations with proven results and industry-leading features
            </p>
          </div>

        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 to-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <MapPin className="h-4 w-4 mr-2" />
              Quick Start
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Minutes
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Jump straight to what you need and start managing your transport Data today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-background/80 backdrop-blur-sm hover:-translate-y-3 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Add New Entry</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Create a new transport entry with our intuitive form system
                </p>
                <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                  <Link href="/entry">
                    Start Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-background/80 backdrop-blur-sm hover:-translate-y-3 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">View Dashboard</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Get comprehensive insights into your business performance
                </p>
                <Button asChild variant="outline" className="w-full group-hover:bg-accent/50 transition-colors">
                  <Link href="/dashboard">
                    Open Dashboard
                    <BarChart3 className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-background/80 backdrop-blur-sm hover:-translate-y-3 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Generate Reports</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Export detailed business reports with advanced filtering
                </p>
                <Button asChild variant="outline" className="w-full group-hover:bg-accent/50 transition-colors">
                  <Link href="/reports">
                    View Reports
                    <FileText className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <Globe className="h-4 w-4 mr-2" />
              Join the Revolution
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-8 text-white">
              Ready to Transform Your{" "}
              <span className="relative">
                Transport Business?
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-white/50 rounded-full" />
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of transport businesses already using our platform to{" "}
              <span className="font-semibold text-white">streamline operations</span> and{" "}
              <span className="font-semibold text-white">increase profits by 40%</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-7 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white/30  hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                <Link href="/login">
                  Sign In to Dashboard
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
