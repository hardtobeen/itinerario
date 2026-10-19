import React from 'react';
import {
  GENERAL_GUIDELINES,
  BOOKING_ALERTS,
  EMERGENCY_CUTS,
  HOTEL_INFO,
} from '../data/itineraryData';
import {
  Clock,
  Ticket,
  Scissors,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

export const GuideSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Hotel & Logistics Summary */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 shadow-sm border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider font-semibold">
              <Building2 className="w-4 h-4" />
              <span>Base Logistica & Soggiorno</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {HOTEL_INFO.name} — {HOTEL_INFO.location}
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Arrivo: <strong className="text-white">{HOTEL_INFO.arrival}</strong>. Partenza:{' '}
              <strong className="text-white">{HOTEL_INFO.departure}</strong>. Connesso direttamente
              con le linee metro <strong>2</strong> e <strong>13</strong> (diretto da Montparnasse, Champs-Élysées e Gare Saint-Lazare).
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/80 rounded-lg p-4 text-xs space-y-2 shrink-0 lg:max-w-xs">
            <div className="font-semibold text-stone-200">Aeroporto & Valigie:</div>
            <p className="text-stone-300">
              • <span className="text-amber-300">Lunedì:</span> Arrivo a Orly (ORY), Metro 14 diretta fino a Saint-Lazare e deposito bagagli all'hotel a Clichy.
            </p>
            <p className="text-stone-300">
              • <span className="text-amber-300">Venerdì:</span> Ritiro valigie in hotel alle 13:50, poi Metro 14 diretta per Orly (volo ore 17:30).
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 3 Essential Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Cosa Prenotare Prima */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
            <Ticket className="w-5 h-5 text-amber-700" />
            <h4 className="font-serif font-bold text-lg text-stone-900">Cosa Prenotare Prima</h4>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Alcuni dei luoghi più visitati richiedono slot orari rigidi per evitare ore di coda.
          </p>

          <div className="mt-4 space-y-3.5 flex-1">
            {BOOKING_ALERTS.map((alert, idx) => (
              <div key={idx} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-stone-900">{alert.title}</span>
                  <span className="text-[11px] font-mono text-stone-500">{alert.day}</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Cosa Tagliare Se Sei in Ritardo */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
            <Scissors className="w-5 h-5 text-rose-700" />
            <h4 className="font-serif font-bold text-lg text-stone-900">Tagliare per Primo</h4>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Se i tempi si allungano o la metro ritarda, ecco i sacrifici indolori studiati nel piano.
          </p>

          <div className="mt-4 space-y-3 flex-1">
            {EMERGENCY_CUTS.map((cut, idx) => (
              <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">{cut.day}</span>
                  <span className="text-xs font-semibold text-stone-900">{cut.target}</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{cut.reason}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>Consiglio:</strong> Mantieni sempre le tappe chiave imperdibili (Notre-Dame, Sainte-Chapelle, Orsay, Torre Eiffel, Louvre, Sacro Cuore) e rinuncia ai negozi se il tramonto si avvicina.
          </div>
        </div>

        {/* Col 3: Come Leggere Questo Piano & Avvertenze */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200">
            <Compass className="w-5 h-5 text-indigo-700" />
            <h4 className="font-serif font-bold text-lg text-stone-900">Regole d'Oro & Verifiche</h4>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Linee guida per muoversi a Parigi senza imprevisti invernali.
          </p>

          <div className="mt-4 space-y-3.5 flex-1">
            {GENERAL_GUIDELINES.map((item, idx) => (
              <div key={idx} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="text-xs font-semibold text-stone-900">{item.title}</div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.text}</p>
              </div>
            ))}

            <div className="pt-2">
              <div className="flex items-start gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>10ème Ciel Rooftop</strong> è stagionale: controlla l'apertura a novembre 2026. Guerrisol, Mangez et cassez-vous e Le Singe qui Lit hanno più sedi: controlla il tuo pin salvato.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Data Flow & Python Pipeline Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h4 className="font-serif font-bold text-lg text-stone-900">
              Architettura Dati Interna & Script Python
            </h4>
            <p className="text-xs text-stone-600 mt-1">
              Questo progetto opera al 100% in codice puro e dati deterministici, senza alcuna dipendenza da API AI o servizi esterni.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/src/data/paris_itinerary.csv"
              download="parigi_16-20_novembre_2026.csv"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Scarica CSV</span>
            </a>
            <a
              href="/src/data/itinerary_data.json"
              download="parigi_itinerario_dati.json"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-800 hover:bg-amber-900 text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>Scarica JSON</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">1. Script Python CLI</span>
            <code className="text-[11px] text-amber-900 font-mono block bg-white p-2 rounded border border-stone-200">
              python3 scripts/paris_itinerary.py
            </code>
            <p className="text-stone-600 mt-2">
              Valida l'integrità delle 47 tappe, verifica coordinate, orari e rigenera i file esportabili.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">2. Flusso Dati Deterministico</span>
            <p className="text-stone-600 leading-relaxed">
              Tutte le 47 tappe, le rotte sulla mappa e la checklist sono gestite localmente in memoria con TypeScript e salvate in <code>localStorage</code> nel browser.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">3. Nessuna Chiamata AI</span>
            <p className="text-stone-600 leading-relaxed">
              Zero chiamate o token consumati verso API AI. L'applicazione rispetta precisamente le tabelle fornite nella guida originale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
