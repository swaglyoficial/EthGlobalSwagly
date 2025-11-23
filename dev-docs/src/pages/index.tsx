import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Swagly Docs"
      description="Pasaporte Web3: conecta, juega y gana merch épica con misiones y ENS.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroContent}>
            <div className={styles.heroLogos}>
              <img src="/img/LogoSwagly.png" alt="Swagly logo" className={styles.logoIcon} />
              <img src="/img/TextoLogoSwagly.png" alt="Swagly" className={styles.logoText} />
            </div>
            <h1 className={styles.title}>
              Pasaporte Web3 <span>que premia tu presencia</span>
            </h1>
            <p className={styles.subtitle}>
              Conecta tu wallet o login social, escanea misiones NFC/QR y gana merch de élite sin pagar gas. Smart
              wallets, ENS y PWA listos para activaciones en vivo.
            </p>
            <div className={styles.ctas}>
              <Link className={styles.primaryCta} to="/docs/setup">
                Comenzar rápido
              </Link>
              <Link className={styles.secondaryCta} to="/docs/vision-arquitectura">
                Ver arquitectura
              </Link>
            </div>
            <div className={styles.badges}>
              <span>Scroll L2 · ERC-4337</span>
              <span>ENS subdomains</span>
              <span>PWA ready</span>
            </div>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.cardHeader}>
              <span className={styles.pill}>Live event</span>
              <span className={styles.score}>+120 SWAG</span>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardTitle}>Completa 3 misiones NFC</p>
              <p className={styles.cardText}>Escanea, reclama y desbloquea merch épica. Gas patrocinado.</p>
              <div className={styles.progress}>
                <div className={styles.progressBar} />
              </div>
              <div className={styles.cardFooter}>
                <span>ENS listo: tuusuario.swagly.eth</span>
                <Link to="/docs/web3" className={styles.link}>
                  Ver detalles →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.tiles}>
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Experiencias</p>
            <h3>Misiones con NFC/QR</h3>
            <p>Flujos en `inicio` y `events` con progreso, badges y CTA “Conectar” siempre visible.</p>
          </div>
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Identidad</p>
            <h3>Smart wallet + ENS</h3>
            <p>In-App Wallet social, paymaster sin gas y subdominios `usuario.swagly.eth` (Name Wrapper + resolver).</p>
          </div>
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Comercio</p>
            <h3>Tienda de merch</h3>
            <p>Landing y `shop` con imágenes optimizadas, lazy load y cards con hover neon.</p>
          </div>
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Mobile</p>
            <h3>PWA listo</h3>
            <p>Service worker, manifest, CTA de instalación y botón “Conectar” verde #B5E86D en navbar sticky.</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
