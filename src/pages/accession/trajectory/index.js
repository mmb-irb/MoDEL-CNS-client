import React, { memo, useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { round } from 'lodash-es';

import {
  CardContent,
  Typography,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

import { ProjectCtx } from '../../../contexts';

import Card from '../../../components/animated-card';
import NGLViewerWithControls from '../../../components/ngl-viewer-with-controls';
import ChainAnalyses from '../../../components/chain-analyses';

import reducedMotion from '../../../utils/reduced-motion';

import style from './style.module.css';

export const TrajectoryMetadata = memo(() => {
  const { metadata } = useContext(ProjectCtx);

  return (
    <fieldset>
      <legend>
        <Typography variant="h6">Statistics</Typography>
      </legend>
      <fieldset>
        <legend>Counts</legend>
        <TextField
          className={style['text-field']}
          label="System atoms"
          title="Total number of atoms in the system"
          value={metadata.SYSTATS}
        />
        <TextField
          className={style['text-field']}
          label="Proteins atoms"
          title="Number of protein atoms in the system"
          value={metadata.PROTATS}
        />
        <TextField
          className={style['text-field']}
          label="Proteins residues"
          title="Number of protein residues in the system"
          value={metadata.PROT}
        />
        <TextField
          className={style['text-field']}
          label="Phospholipids"
          title="Number of membrane molecules in the system"
          value={metadata.DPPC}
        />
        <TextField
          className={style['text-field']}
          label="Solvent molecules"
          title="Number of solvent molecules in the system"
          value={metadata.SOL}
        />
        <TextField
          className={style['text-field']}
          label="Positive ions"
          title="Number of positively charged ions in the system"
          value={metadata.NA}
        />
        <TextField
          className={style['text-field']}
          label="Negative ions"
          title="Number of negatively charged ions in the system"
          value={metadata.CL}
        />
      </fieldset>
      <fieldset>
        <legend>Simulation box</legend>
        <TextField
          className={style['text-field']}
          label="Type"
          title="Box type"
          value={metadata.BOXTYPE}
        />
        <TextField
          className={style['text-field']}
          label="Size X"
          title="Simulated system box X dimension"
          value={metadata.BOXSIZEX}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                nm
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Size Y"
          title="Simulated system box Y dimension"
          value={metadata.BOXSIZEY}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                nm
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Size Z"
          title="Simulated system box Z dimension"
          value={metadata.BOXSIZEZ}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                nm
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Volume"
          title="Simulated system box volume"
          value={
            metadata.BOXSIZEX &&
            round(
              +metadata.BOXSIZEX * +metadata.BOXSIZEY * +metadata.BOXSIZEZ,
              5,
            )
          }
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                nm³
              </InputAdornment>
            ),
          }}
        />
      </fieldset>
      <fieldset>
        <legend>Other</legend>
        <TextField
          className={style['text-field']}
          label="Length"
          title="Simulation length"
          value={metadata.LENGTH}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                ns
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Timestep"
          title="Simulation timestep"
          value={metadata.TIMESTEP}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                fs
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Snapshots"
          title="Number of snapshots"
          value={metadata.SNAPSHOTS}
        />
        <TextField
          className={style['text-field']}
          label="Frequency"
          title="Frequency of snapshots"
          value={metadata.FREQUENCY}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                ps
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Force field"
          title="Force field"
          value={metadata.FF}
        />
        <TextField
          className={style['text-field']}
          label="Temperature"
          title="Temperature"
          value={metadata.TEMP}
          InputProps={{
            endAdornment: (
              <InputAdornment variant="filled" position="end">
                K
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={style['text-field']}
          label="Water type"
          title="Water type"
          value={metadata.WAT}
        />
        <TextField
          className={style['text-field']}
          label="Ensemble"
          title="Simulation ensemble"
          value={metadata.ENSEMBLE}
        />
        <TextField
          className={style['text-field']}
          label="Pressure coupling"
          title="Pressure coupling method"
          value={metadata.PCOUPLING}
        />
        <TextField
          className={style['text-field']}
          label="Membrane"
          title="Membrane type"
          value={metadata.MEMBRANE}
        />
      </fieldset>
    </fieldset>
  );
});

const dbMap = new Map([
  ['InterPro', 'InterPro'],
  // special cases
  ['TIGRFAM', 'tigrfams'],
  ['PROSITE_PROFILES', 'profile'],
  ['PROSITE_PATTERNS', 'prosite'],
  ['SUPERFAMILY', 'ssf'],
  ['GENE3D', 'cathgene3d'],
  // just the same, but lowercase
  ['CDD', 'cdd'],
  ['HAMAP', 'hamap'],
  ['PANTHER', 'panther'],
  ['PFAM', 'pfam'],
  ['PIRSF', 'pirsf'],
  ['PRINTS', 'prints'],
  ['SFLD', 'sfld'],
  ['SMART', 'smart'],
]);

const Analyses = memo(() => {
  const { chains, accession, identifier } = useContext(ProjectCtx);

  useEffect(() => {
    // Bypass React for DOM alteration
    const popup = document.createElement('div');
    popup.className = style.popup;
    let portal, portalContainer;
    // NOTE: see https://web.dev/hands-on-portals for tutorial on Portals
    if ('HTMLPortalElement' in window) {
      portalContainer = document.createElement('div');
      portalContainer.className = style['portal-container'];
      portal = document.createElement('portal');
      portalContainer.appendChild(portal);
      popup.appendChild(portalContainer);
      portal.addEventListener('click', () => {
        const bcr = portal.getBoundingClientRect();
        portal.animate(
          { transform: [`scale(1) translate(${-bcr.left}px, ${-bcr.top}px)`] },
          {
            duration: reducedMotion() ? 0 : 1000,
            easing: 'cubic-bezier(.23,-0.26,0,1)',
            fill: 'both',
          },
        ).onfinish = () => {
          // TODO: whenever the bug removing history when activating a portal is
          // TODO: fixed, use this piece of code
          // portal.activate();
          // TODO: in the meantime... (yes, it does an ugly flash 🤷‍)
          window.location.href = portal.src;
        };
      });
    }
    const link = document.createElement('a');
    link.rel = 'noopener';
    link.target = '_blank';
    popup.appendChild(link);

    let displayed = false;
    let timeout;

    const clearPopup = () => {
      link.textContent = '';
      link.href = '';
      if (portal) {
        portalContainer.style.display = 'none';
        portal.src = null;
        portal.removeAttribute('src');
      }
      popup.style.visibility = 'hidden';
      popup.style.transform = 'translate(0, 0)';
    };

    const popupEnterHandle = () => clearTimeout(timeout);
    const popupLeaveHandle = () => (timeout = setTimeout(clearPopup, 1000));

    popup.addEventListener('mouseenter', popupEnterHandle);
    popup.addEventListener('mouseleave', popupLeaveHandle);

    const handler = event => {
      if (!event.detail) return;
      let bcrTarget, bcrPopup, bcrTrack;
      switch (event.detail.eventtype) {
        case 'mouseover':
          if (!event.detail.feature.accession) return;

          clearTimeout(timeout);

          const IP_DB = dbMap.get(event.detail.feature.db);
          const href =
            IP_DB &&
            `https://www.ebi.ac.uk/interpro/entry/${IP_DB}/${event.detail.feature.accession}/`;
          if (portal && IP_DB) portal.src = href;
          link.textContent = `${event.detail.feature.db} - ${event.detail.feature.accession}`;
          link.href = href;
          if (IP_DB) {
            if (portal) portalContainer.style.display = 'block';
          } else {
            if (portal) {
              portalContainer.style.display = 'none';
              portal.removeAttribute('src');
              portal.src = null;
            }
            link.removeAttribute('href');
          }

          bcrTarget = event.detail.target.getBoundingClientRect();
          bcrPopup = popup.getBoundingClientRect();
          bcrTrack = event.detail.target
            .closest('protvista-interpro-track')
            .getBoundingClientRect();

          // x
          const translateX = Math.min(
            Math.max(
              // center the popup in the middle of the region
              bcrTarget.left + bcrTarget.width / 2 - bcrPopup.width / 2,
              // make sure the popup doesn't overflow to the left
              bcrTrack.left,
            ),
            // make sure the popup doesn't overflow to the right
            bcrTrack.right - bcrPopup.width,
          );
          // y
          const translateY = window.scrollY + bcrTarget.top - bcrPopup.height;

          popup.style.visibility = 'visible';
          popup.style.transform = `translate(${translateX}px, ${translateY}px)`;

          displayed = true;
          break;
        case 'mouseout':
          if (!displayed) return; // no need to do DOM operation, it's already invisible
          timeout = setTimeout(clearPopup, 1000);

          displayed = false;
          break;
        default:
        // ignore
      }
    };
    document.body.appendChild(popup);
    window.addEventListener('change', handler);
    return () => {
      window.removeEventListener('change', handler);
      popup.removeEventListener('mouseenter', popupEnterHandle);
      popup.removeEventListener('mouseleave', popupLeaveHandle);
      document.body.removeChild(popup);
    };
  }, []);

  return (
    <>
      <Typography variant="h6">Protein functional analysis</Typography>
      <p>{chains.length} chains were analysed</p>
      <p>
        Powered by{' '}
        <a
          href="https://www.ebi.ac.uk/interpro/"
          target="_blank"
          rel="noreferrer noopener"
        >
          InterProScan
        </a>
      </p>
      <ul className={style['chain-analysis-list']}>
        {chains.map(chain => (
          <li key={chain}>
            <Typography variant="h6">
              <FontAwesomeIcon icon={faAngleRight} /> Chain {chain}
            </Typography>
            <ChainAnalyses chain={chain} accession={accession || identifier} />
          </li>
        ))}
      </ul>
    </>
  );
});

const useInViewOptions = { triggerOnce: true, rootMargin: '100px' };

const Trajectory = () => {
  const [nglRef, isNglVisible] = useInView(useInViewOptions);
  const [nightingaleRef, isNightingaleVisible] = useInView(useInViewOptions);

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <TrajectoryMetadata />
        </CardContent>
      </Card>
      <Card className={style.card} ref={nglRef}>
        {isNglVisible ? (
          <NGLViewerWithControls className={style.container} />
        ) : (
          <div style={{ height: '50vh' }} />
        )}
      </Card>
      <Card className={style.card} ref={nightingaleRef}>
        {isNightingaleVisible ? (
          <CardContent>
            <Analyses />
          </CardContent>
        ) : (
          <div style={{ height: '50vh' }} />
        )}
      </Card>
    </>
  );
};

export default Trajectory;
