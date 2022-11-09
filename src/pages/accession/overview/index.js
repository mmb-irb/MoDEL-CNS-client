import React, { useContext } from 'react';
import {
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import Card from '../../../components/animated-card';
import LazyImg from '../../../components/lazy-img';

import { ProjectCtx } from '../../../contexts';

import style from './style.module.css';

const COMMA_SEPARATOR = /\s*,\s*/;

export default React.memo(() => {
  const { pdbInfo, accession, identifier, published } = useContext(ProjectCtx);

  const lowerPdb = pdbInfo.identifier.toLowerCase();
  const imgSrc =
    pdbInfo &&
    pdbInfo.identifier &&
    `https://cdn.rcsb.org/images/structures/${lowerPdb.substr(
      1,
      2,
    )}/${lowerPdb}/${lowerPdb}_assembly-1.jpeg`;
  let organisms;
  let keywords;
  let publishDate;
  if (pdbInfo && pdbInfo.identifier) {
    organisms = Array.from(
      new Set((pdbInfo.sources || '').split(COMMA_SEPARATOR)),
    );
    keywords = Array.from(
      new Set((pdbInfo.header || '').split(COMMA_SEPARATOR)),
    );
    publishDate = new Date(pdbInfo.ascDate);
  }

  return (
    <>
      {pdbInfo && pdbInfo.identifier && (
        <Card className={style.card}>
          <CardContent className={style['card-content']}>
            <Typography variant="h6">PDB information</Typography>
            <LazyImg
              src={imgSrc}
              width="350"
              height="350"
              loading="lazy"
              alt={`3D view of the ${pdbInfo.identifier} structure`}
            />
            {pdbInfo && (
              <div className={style['summary-list']}>
                <div>{pdbInfo.title}</div>
                <div>
                  PDB Accession: {pdbInfo.identifier}
                  {pdbInfo.replaces && ` (replaces ${pdbInfo.replaces})`}
                </div>
                <div>
                  {pdbInfo.status &&
                    pdbInfo.status !== 'CURRENT' &&
                    `Status: ${pdbInfo.status}`}
                </div>
                <div>Experimental method: {pdbInfo.expClass.toLowerCase()}</div>
                <div>
                  Organism
                  {organisms.length > 1 && 's'}:{' '}
                  {organisms.map(organism => (
                    <Chip
                      key={organism}
                      label={organism}
                      variant="outlined"
                      color="primary"
                      className={style.chip}
                    />
                  ))}
                </div>
                <div>
                  Keyword
                  {keywords.length > 1 && 's'}:{' '}
                  {keywords.map(keyword => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      variant="outlined"
                      color="primary"
                      className={style.chip}
                    />
                  ))}
                </div>
                <div>
                  Publication date:{' '}
                  <time dateTime={publishDate.toISOString()}>
                    {publishDate.toDateString()}
                  </time>
                </div>
              </div>
            )}
          </CardContent>
          <CardActions>
            <Button
              component={'a'}
              variant="contained"
              href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbInfo.identifier}`}
              size="small"
              color="primary"
              target="_blank"
              rel="noreferrer noopener"
            >
              <FontAwesomeIcon icon={faLink} />
              &nbsp;PDBe website
            </Button>
            <Button
              component={'a'}
              variant="contained"
              href={`https://www.rcsb.org/structure/${pdbInfo.identifier}`}
              size="small"
              color="primary"
              target="_blank"
              rel="noreferrer noopener"
            >
              <FontAwesomeIcon icon={faLink} />
              &nbsp;RCSB website
            </Button>
          </CardActions>
        </Card>
      )}
      <Card className={style.card}>
        <CardContent className={style['card-content']}>
          <Typography variant="h6">Project information</Typography>
          <div className={style['summary-list']}>
            <div>
              Public project accession: {accession || <code>not assigned</code>}
            </div>
            <div>Internal project identifier: {identifier}</div>
            <div>Status: {published ? 'published' : 'unpublished'}</div>
          </div>
        </CardContent>
      </Card>
    </>
  );
});
