import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, BellIcon, NewspaperIcon, SparklesIcon, ShieldCheckIcon, ArrowRightIcon } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    notificationsToday: 0,
    totalNotifications: 0
  });

  useEffect(() => {
    // Fetch stats if user is authenticated
    if (isAuthenticated) {
      // This would be replaced with actual API calls
      setStats({
        activeSubscriptions: 4,
        notificationsToday: 12,
        totalNotifications: 1243
      });
    }
  }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <section className="relative py-20 mb-12 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,transparent,50%,black)]"></div>
        <div className="absolute right-0 top-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-0 bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <Badge variant="secondary" className="mb-4">
            <SparklesIcon className="h-3.5 w-3.5 mr-1" />
            Never miss official announcements
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Stay informed on <span className="text-primary">official publications</span> that matter to you
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            NIFYA delivers real-time alerts from official government sources like BOE and DOGA, ensuring you never miss critical announcements relevant to your interests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard <ArrowRightIcon className="ml-2 h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth?mode=signup">Get Started <ArrowRightIcon className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth?mode=login">Log In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose NIFYA?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform simplifies monitoring official publications, saving you time and ensuring you stay compliant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <NewspaperIcon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Official Sources</CardTitle>
              <CardDescription>
                Direct monitoring of BOE, DOGA, and other official publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Get information directly from authoritative sources with no intermediaries, ensuring accuracy and reliability.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BellIcon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Notifications</CardTitle>
              <CardDescription>
                Instant alerts when relevant publications appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Receive notifications via email as soon as new publications matching your criteria are published.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CalendarIcon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Custom Frequency</CardTitle>
              <CardDescription>
                Control how often you want to receive updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Choose between real-time, daily, or weekly digests based on your needs and preferences.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section (for authenticated users) */}
      {isAuthenticated && (
        <section className="py-10 mb-20 bg-muted/50 rounded-2xl">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Your NIFYA Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeSubscriptions}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Notifications Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.notificationsToday}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalNotifications}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials/Use Cases */}
      <section className="py-16 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Who Uses NIFYA?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform serves professionals across various industries who need to stay informed on official publications.
          </p>
        </div>

        <Tabs defaultValue="legal" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="legal">Legal Professionals</TabsTrigger>
            <TabsTrigger value="business">Businesses</TabsTrigger>
            <TabsTrigger value="public">Public Sector</TabsTrigger>
          </TabsList>
          <TabsContent value="legal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Professionals</CardTitle>
                <CardDescription>Lawyers, notaries, and legal consultants</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Stay updated on legislative changes, court decisions, and regulatory developments relevant to your practice areas. NIFYA helps legal professionals ensure compliance and provide up-to-date advice to clients.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="business" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Businesses</CardTitle>
                <CardDescription>Companies of all sizes across sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Monitor regulations affecting your industry, government contracts and tenders, subsidies, and other business opportunities. NIFYA helps businesses stay compliant and identify new opportunities.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="public" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Public Sector</CardTitle>
                <CardDescription>Government agencies and civil servants</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Track policy changes, administrative announcements, and inter-departmental communications. NIFYA helps public sector employees stay informed on developments relevant to their work.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5 rounded-3xl mb-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to stay informed?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who rely on NIFYA to never miss important official publications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/subscriptions/new">Create New Subscription</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth?mode=signup">Get Started Today</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-10 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Trusted Security</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheckIcon className="h-10 w-10 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Data Protection</h3>
            <p className="text-muted-foreground text-sm">GDPR Compliant</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheckIcon className="h-10 w-10 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Secure Authentication</h3>
            <p className="text-muted-foreground text-sm">Industry Standard</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheckIcon className="h-10 w-10 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Private Data</h3>
            <p className="text-muted-foreground text-sm">Never Shared</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link to="/testimonials" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link to="/guides" className="text-sm text-muted-foreground hover:text-foreground">Guides</Link></li>
              <li><Link to="/api" className="text-sm text-muted-foreground hover:text-foreground">API</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NIFYA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 