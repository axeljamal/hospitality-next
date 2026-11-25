import type { Venue } from '@/venues/types';
import { jsonLdString, venueJsonLd } from '@/lib/seo';
import { SiteProvider, Toast } from './SiteContext';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { QuickBook } from './sections/QuickBook';
import { Perks } from './sections/Perks';
import { House } from './sections/House';
import { Film } from './sections/Film';
import { Gallery } from './sections/Gallery';
import { Seasons } from './sections/Seasons';
import { Offers } from './sections/Offers';
import { Booking } from './sections/Booking';
import { Guide } from './sections/Guide';
import { Local } from './sections/Local';
import { Reviews } from './sections/Reviews';
import { Follow } from './sections/Follow';
import { Footer } from './sections/Footer';
import { TabBar } from './sections/TabBar';

/** The whole guest site for one venue. Sections render in the order of the original Beam House page. */
export function VenueSite({ venue }: { venue: Venue }) {
  return (
    <SiteProvider venue={venue}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(venueJsonLd(venue)) }} />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <QuickBook />
        <Perks venue={venue} />
        <House />
        <Film />
        <Gallery />
        <Seasons />
        <Offers />
        <Booking />
        <Guide />
        <Local />
        <Reviews venue={venue} />
        <Follow />
      </main>
      <Footer />
      <TabBar />
      <Toast />
    </SiteProvider>
  );
}
