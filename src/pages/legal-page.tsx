import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { Link, useParams } from "react-router"

type LegalKind = "privacy" | "termini" | "contatti"

const CONTENT: Record<LegalKind, { title: string; sections: Array<{ heading: string; body: string }> }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Dati raccolti",
        body: "ANTWHEELS Configurator raccoglie i dati necessari per creare e gestire l'account, come nome, email e credenziali di accesso. L'app salva inoltre configurazioni ruote, preventivi e informazioni tecniche selezionate dall'utente.",
      },
      {
        heading: "Finalita del trattamento",
        body: "I dati vengono usati per autenticare l'utente, salvare configurazioni, generare preventivi, mostrare lo storico e permettere la gestione dell'account. Non sono previsti utilizzi per newsletter o marketing automatico salvo diversa comunicazione esplicita.",
      },
      {
        heading: "Conservazione e cancellazione",
        body: "I dati restano salvati finche l'account e attivo o finche necessari per gestire configurazioni e preventivi. L'utente puo richiedere o usare la cancellazione dell'account, con rimozione dei dati collegati secondo le funzionalita disponibili nell'app.",
      },
      {
        heading: "Servizi tecnici",
        body: "L'app puo utilizzare servizi di hosting, database e API per rendere disponibile il configuratore online. I dati tecnici necessari al funzionamento possono transitare attraverso tali servizi.",
      },
    ],
  },
  termini: {
    title: "Termini di utilizzo",
    sections: [
      {
        heading: "Uso dell'app",
        body: "ANTWHEELS Configurator consente di configurare ruote da ciclismo, salvare configurazioni e generare preventivi indicativi. L'utente si impegna a usare l'app in modo corretto e a fornire dati veritieri durante la registrazione.",
      },
      {
        heading: "Preventivi",
        body: "I prezzi e i riepiloghi generati dall'app hanno valore informativo e possono essere soggetti a verifica, disponibilita dei componenti, aggiornamenti tecnici o variazioni commerciali.",
      },
      {
        heading: "Richieste personalizzate",
        body: "Per configurazioni particolari, componenti non presenti nel configuratore o richieste tecniche specifiche, e possibile contattarci direttamente. Valuteremo la fattibilita, la compatibilita dei componenti e un preventivo dedicato in base alle esigenze del cliente.",
      },
      {
        heading: "Account",
        body: "L'utente e responsabile della riservatezza delle proprie credenziali. In caso di uso improprio, accessi non autorizzati o richiesta di cancellazione, l'account puo essere modificato o rimosso secondo le funzionalita previste.",
      },
      {
        heading: "Limitazioni",
        body: "Il servizio viene fornito secondo disponibilita tecnica. Aggiornamenti, manutenzioni o problemi di rete possono limitare temporaneamente l'accesso all'app o alle configurazioni salvate.",
      },
    ],
  },
  contatti: {
    title: "Contatti",
    sections: [
      {
        heading: "Telefono",
        body: "+39 3283162784",
      },
      {
        heading: "Email",
        body: "paolascorrano972@gmail.com",
      },
    ],
  },
}

export default function LegalPage() {
  const { type } = useParams<{ type?: string }>()
  const kind = isLegalKind(type) ? type : "privacy"
  const content = CONTENT[kind]

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <Button variant="ghost" size="sm" className="mb-8 rounded-full" render={<Link to="/" />}>
        <ArrowLeft className="size-4" />
        Home
      </Button>

      <div className="mb-10 border-b border-white/10 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Informazioni legali
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h1>
      </div>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading} className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {section.heading === "Email" ? (
                <a className="inline-flex items-center gap-2 text-foreground underline underline-offset-4" href={`mailto:${section.body}`}>
                  <Mail className="size-4" />
                  {section.body}
                </a>
              ) : section.heading === "Telefono" ? (
                <a className="inline-flex items-center gap-2 text-foreground underline underline-offset-4" href={`tel:${section.body.replace(/\s/g, "")}`}>
                  <Phone className="size-4" />
                  {section.body}
                </a>
              ) : (
                section.body
              )}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

function isLegalKind(value?: string): value is LegalKind {
  return value === "privacy" || value === "termini" || value === "contatti"
}
