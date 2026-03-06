import { Button } from "@/components/ui/button";

export const Careers4 = ({
  heading = "Join Our Security Team",

  jobs = [
    {
      category: "Security Engineering",
      openings: [
        {
          title: "Senior Penetration Tester",
          location: "Remote",
          url: "#",
        },
        {
          title: "Security Analyst",
          location: "Addis Ababa",
          url: "#",
        },
        {
          title: "Vulnerability Researcher",
          location: "Remote",
          url: "#",
        },
        {
          title: "Security Architect",
          location: "Addis Ababa",
          url: "#",
        },
      ],
    },
    {
      category: "Development",
      openings: [
        {
          title: "Full Stack Developer",
          location: "Remote",
          url: "#",
        },
        {
          title: "AI/ML Engineer",
          location: "Addis Ababa",
          url: "#",
        },
      ],
    },
  ]
}) => {
  return (
    <section className="py-32 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-block rounded-3xl bg-muted px-3 py-1 text-sm mb-4">
              Careers
            </div>
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
              {heading}
            </h1>
            <p className="text-muted-foreground md:text-xl mb-8">
              Help us protect digital infrastructure and make the internet safer for everyone
            </p>
          </div>
          <div className="mt-14 flex flex-col gap-16">
            {jobs.map((jobCategory) => (
              <div key={jobCategory.category} className="border border-muted rounded-3xl p-6 bg-background/80">
                <h2 className="border-b pb-4 text-xl font-bold text-primary">
                  {jobCategory.category}
                </h2>
                {jobCategory.openings.map((job) => (
                  <div
                    key={job.title}
                    className="flex items-center justify-between border-b py-4 last:border-b-0 hover:bg-muted/50 px-4 rounded-lg transition-colors">
                    <a href={job.url} className="font-semibold hover:text-primary transition-colors">
                      {job.title}
                    </a>
                    <Button variant="outline" size="sm" className="rounded-3xl">
                      {job.location}
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
