import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LiveProvider } from './lib/store';
import { ThemeProvider } from './lib/theme';
import { I18nProvider } from './lib/i18n';
import { Shell } from './components/Shell';

const Overview = lazy(() => import('./pages/Overview').then((m) => ({ default: m.Overview })));
const DigitalTwin = lazy(() => import('./pages/DigitalTwin').then((m) => ({ default: m.DigitalTwin })));
const Construction = lazy(() => import('./pages/Construction').then((m) => ({ default: m.Construction })));
const BIMStudio = lazy(() => import('./pages/BIMStudio').then((m) => ({ default: m.BIMStudio })));
const BimSite = lazy(() => import('./pages/BimSite').then((m) => ({ default: m.BimSite })));
const BimWorkflows = lazy(() => import('./pages/BimWorkflows').then((m) => ({ default: m.BimWorkflows })));
const HoloBIM = lazy(() => import('./pages/HoloBIM').then((m) => ({ default: m.HoloBIM })));
const ESGBuilding = lazy(() => import('./pages/ESGBuilding').then((m) => ({ default: m.ESGBuilding })));
const EsgWorld = lazy(() => import('./pages/EsgWorld').then((m) => ({ default: m.EsgWorld })));
const DCOps = lazy(() => import('./pages/DCOps').then((m) => ({ default: m.DCOps })));
const Mobility = lazy(() => import('./pages/Mobility').then((m) => ({ default: m.Mobility })));
const Safety = lazy(() => import('./pages/Safety').then((m) => ({ default: m.Safety })));
const SupplyChain = lazy(() => import('./pages/SupplyChain').then((m) => ({ default: m.SupplyChain })));
const WarRoom = lazy(() => import('./pages/WarRoom').then((m) => ({ default: m.WarRoom })));
const Cyber = lazy(() => import('./pages/Cyber').then((m) => ({ default: m.Cyber })));
const People = lazy(() => import('./pages/People').then((m) => ({ default: m.People })));
const Place = lazy(() => import('./pages/Place').then((m) => ({ default: m.Place })));
const Design = lazy(() => import('./pages/Design').then((m) => ({ default: m.Design })));
const Plant = lazy(() => import('./pages/Plant').then((m) => ({ default: m.Plant })));
const Capital = lazy(() => import('./pages/Capital').then((m) => ({ default: m.Capital })));
const Labs = lazy(() => import('./pages/Labs').then((m) => ({ default: m.Labs })));
const Ground = lazy(() => import('./pages/Ground').then((m) => ({ default: m.Ground })));
const Facade = lazy(() => import('./pages/Facade').then((m) => ({ default: m.Facade })));
const Seismic = lazy(() => import('./pages/Seismic').then((m) => ({ default: m.Seismic })));
const Port = lazy(() => import('./pages/Port').then((m) => ({ default: m.Port })));
const Waste = lazy(() => import('./pages/Waste').then((m) => ({ default: m.Waste })));
const Traffic = lazy(() => import('./pages/Traffic').then((m) => ({ default: m.Traffic })));
const Fire = lazy(() => import('./pages/Fire').then((m) => ({ default: m.Fire })));
const Fleet = lazy(() => import('./pages/Fleet').then((m) => ({ default: m.Fleet })));
const Procurement = lazy(() => import('./pages/Procurement').then((m) => ({ default: m.Procurement })));
const Contracts = lazy(() => import('./pages/Contracts').then((m) => ({ default: m.Contracts })));
const Handover = lazy(() => import('./pages/Handover').then((m) => ({ default: m.Handover })));
const Acoustics = lazy(() => import('./pages/Acoustics').then((m) => ({ default: m.Acoustics })));
const Insurance = lazy(() => import('./pages/Insurance').then((m) => ({ default: m.Insurance })));
const Data = lazy(() => import('./pages/Data').then((m) => ({ default: m.Data })));
const Quality = lazy(() => import('./pages/Quality').then((m) => ({ default: m.Quality })));
const Utilities = lazy(() => import('./pages/Utilities').then((m) => ({ default: m.Utilities })));
const Assets = lazy(() => import('./pages/Assets').then((m) => ({ default: m.Assets })));
const Heritage = lazy(() => import('./pages/Heritage').then((m) => ({ default: m.Heritage })));
const Maintenance = lazy(() => import('./pages/Maintenance').then((m) => ({ default: m.Maintenance })));
const Deals = lazy(() => import('./pages/Deals').then((m) => ({ default: m.Deals })));
const Power = lazy(() => import('./pages/Power').then((m) => ({ default: m.Power })));
const Ev = lazy(() => import('./pages/Ev').then((m) => ({ default: m.Ev })));
const Vehicles = lazy(() => import('./pages/Vehicles').then((m) => ({ default: m.Vehicles })));
const Workplace = lazy(() => import('./pages/Workplace').then((m) => ({ default: m.Workplace })));
const Resilience = lazy(() => import('./pages/Resilience').then((m) => ({ default: m.Resilience })));
const Water = lazy(() => import('./pages/Water').then((m) => ({ default: m.Water })));
const Factory = lazy(() => import('./pages/Factory').then((m) => ({ default: m.Factory })));
const Engineering = lazy(() => import('./pages/Engineering').then((m) => ({ default: m.Engineering })));
const PropTech = lazy(() => import('./pages/PropTech').then((m) => ({ default: m.PropTech })));
const ESGPage = lazy(() => import('./pages/ESG').then((m) => ({ default: m.ESG })));
const EnergyGrid = lazy(() => import('./pages/EnergyGrid').then((m) => ({ default: m.EnergyGrid })));
const AgentOps = lazy(() => import('./pages/AgentOps').then((m) => ({ default: m.AgentOps })));
const Geospatial = lazy(() => import('./pages/Geospatial').then((m) => ({ default: m.Geospatial })));
const Intelligence = lazy(() => import('./pages/Intelligence').then((m) => ({ default: m.Intelligence })));
const TrustLedger = lazy(() => import('./pages/TrustLedger').then((m) => ({ default: m.TrustLedger })));
const Portfolio = lazy(() => import('./pages/Portfolio').then((m) => ({ default: m.Portfolio })));
const Architecture = lazy(() => import('./pages/Architecture').then((m) => ({ default: m.Architecture })));
const ExecutiveBrief = lazy(() => import('./pages/ExecutiveBrief').then((m) => ({ default: m.ExecutiveBrief })));

function RouteLoader() {
  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-4" aria-busy="true" aria-label="Loading workspace">
      <div className="h-3 w-44 animate-pulse rounded-full bg-white/[.06]" />
      <div className="h-8 w-80 animate-pulse rounded-lg bg-white/[.05]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="panel h-[104px] animate-pulse" />)}
      </div>
      <div className="panel h-[440px] animate-pulse" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LiveProvider>
          <HashRouter>
        <Shell>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/twin" element={<DigitalTwin />} />
              <Route path="/construction" element={<Construction />} />
              <Route path="/bim" element={<BIMStudio />} />
              <Route path="/bim-site" element={<BimSite />} />
              <Route path="/bim-workflows" element={<BimWorkflows />} />
              <Route path="/bim-xr" element={<HoloBIM />} />
              <Route path="/esg-building" element={<ESGBuilding />} />
              <Route path="/esg-world" element={<EsgWorld />} />
              <Route path="/dc-ops" element={<DCOps />} />
              <Route path="/mobility" element={<Mobility />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/supply" element={<SupplyChain />} />
              <Route path="/war-room" element={<WarRoom />} />
              <Route path="/cyber" element={<Cyber />} />
              <Route path="/people" element={<People />} />
              <Route path="/place" element={<Place />} />
              <Route path="/design" element={<Design />} />
              <Route path="/plant" element={<Plant />} />
              <Route path="/capital" element={<Capital />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/ground" element={<Ground />} />
              <Route path="/facade" element={<Facade />} />
              <Route path="/seismic" element={<Seismic />} />
              <Route path="/port" element={<Port />} />
              <Route path="/waste" element={<Waste />} />
              <Route path="/traffic" element={<Traffic />} />
              <Route path="/fire" element={<Fire />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/procurement" element={<Procurement />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/handover" element={<Handover />} />
              <Route path="/acoustics" element={<Acoustics />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/data" element={<Data />} />
              <Route path="/quality" element={<Quality />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/heritage" element={<Heritage />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/power" element={<Power />} />
              <Route path="/ev" element={<Ev />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/workplace" element={<Workplace />} />
              <Route path="/resilience" element={<Resilience />} />
              <Route path="/water" element={<Water />} />
              <Route path="/factory" element={<Factory />} />
              <Route path="/engineering" element={<Engineering />} />
              <Route path="/proptech" element={<PropTech />} />
              <Route path="/esg" element={<ESGPage />} />
              <Route path="/energy" element={<EnergyGrid />} />
              <Route path="/map" element={<Geospatial />} />
              <Route path="/intelligence" element={<Intelligence />} />
              <Route path="/trust" element={<TrustLedger />} />
              <Route path="/agents" element={<AgentOps />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/brief" element={<ExecutiveBrief />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Shell>
          </HashRouter>
        </LiveProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
