import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
} from '@material-ui/core';
import { Language } from '@material-ui/icons';

import style from './style.module.css';

const COMMA_SEPARATOR = /\s*,\s*/;

export default React.memo(({ pdbData }) => {
  const imgSrc = `//cdn.rcsb.org/images/hd/${pdbData.identifier
    .toLowerCase()
    .substr(
      1,
      2,
    )}/${pdbData.identifier.toLowerCase()}/${pdbData.identifier.toLowerCase()}.0_chimera_tm_350_350.png`;
  let organisms;
  let keywords;
  let publishDate;
  if (pdbData) {
    organisms = Array.from(new Set(pdbData.sources.split(COMMA_SEPARATOR)));
    keywords = Array.from(new Set(pdbData.header.split(COMMA_SEPARATOR)));
    publishDate = new Date(pdbData.ascDate);
  }

  return (
    <Card className={style.card}>
      <CardContent className={style['card-content']}>
        <Typography variant="h6">PDB information</Typography>
        <img
          src={imgSrc}
          alt={`3D view of the ${pdbData.identifier} structure`}
        />
        {pdbData && (
          <div className={style['summary-list']}>
            <div>{pdbData.title}</div>
            <div>
              PDB Accession: {pdbData.structureId}
              {pdbData.replaces && ` (replaces ${pdbData.replaces})`}
            </div>
            <div>
              {pdbData.status &&
                pdbData.status !== 'CURRENT' &&
                `Status: ${pdbData.status}`}
            </div>
            <div>Experimental method: {pdbData.expClass.toLowerCase()}</div>
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
          href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbData.identifier}`}
          size="small"
          color="primary"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Language />
          PDBe website
        </Button>
        <Button
          component={'a'}
          variant="contained"
          href={`https://www.rcsb.org/structure/${pdbData.identifier}`}
          size="small"
          color="primary"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Language />
          RCSB website
        </Button>
      </CardActions>
    </Card>
  );
});
