import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
} from '@material-ui/core';
import { Language } from '@material-ui/icons';

import { ProjectCtx } from '../../../contexts';

import style from './style.module.css';

const COMMA_SEPARATOR = /\s*,\s*/;

export default React.memo(() => {
  const { pdbInfo } = useContext(ProjectCtx);

  const imgSrc = `//cdn.rcsb.org/images/hd/${pdbInfo.identifier
    .toLowerCase()
    .substr(
      1,
      2,
    )}/${pdbInfo.identifier.toLowerCase()}/${pdbInfo.identifier.toLowerCase()}.0_chimera_tm_350_350.png`;
  let organisms;
  let keywords;
  let publishDate;
  if (pdbInfo) {
    organisms = Array.from(new Set(pdbInfo.sources.split(COMMA_SEPARATOR)));
    keywords = Array.from(new Set(pdbInfo.header.split(COMMA_SEPARATOR)));
    publishDate = new Date(pdbInfo.ascDate);
  }

  return (
    <Card className={style.card}>
      <CardContent className={style['card-content']}>
        <Typography variant="h6">PDB information</Typography>
        <img
          src={imgSrc}
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
          <Language />
          PDBe website
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
          <Language />
          RCSB website
        </Button>
      </CardActions>
    </Card>
  );
});
