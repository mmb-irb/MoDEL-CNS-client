import React, { PureComponent } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
} from '@material-ui/core';
import { Language, LibraryBooks } from '@material-ui/icons';

import mounted from '../../../utils/mounted';
import accessionToPDBAccession from '../../../utils/accession-to-pdb-accession';

import style from './style.module.css';

const COMMA_SEPARATOR = /\s*,\s*/;

export default class Overview extends PureComponent {
  state = { pdbData: null };

  async componentDidMount() {
    mounted.add(this);
    const response = await fetch(
      `https://www.rcsb.org/pdb/json/describePDB?structureId=${
        this.props.match.params.accession
      }`,
    );
    const data = await response.json();
    if (mounted.has(this)) this.setState({ pdbData: data[0] });
  }

  componentWillUnmount() {
    mounted.delete(this);
  }

  render() {
    const { accession } = this.props.match.params;
    const PDBAccession = accessionToPDBAccession(accession);
    let imgSrc;
    if (accession.endsWith('mb')) {
      imgSrc = `//cdn.rcsb.org/images/hd/${PDBAccession.substr(
        1,
        2,
      )}/${PDBAccession}/${PDBAccession}.0_chimera_tm_350_350.png`;
    } else {
      imgSrc = `https://cdn.rcsb.org/images/rutgers/${PDBAccession.substr(
        1,
        2,
      )}/${PDBAccession}/${PDBAccession}.pdb1-250.jpg`;
    }
    const { pdbData } = this.state;
    let organisms;
    let keywords;
    let publishDate;
    let revisionDate;
    if (pdbData) {
      organisms = Array.from(new Set(pdbData.organism.split(COMMA_SEPARATOR)));
      keywords = Array.from(new Set(pdbData.keywords.split(COMMA_SEPARATOR)));
      publishDate = new Date(pdbData.publish_date);
      revisionDate = new Date(pdbData.revision_date);
    }

    return (
      <Card className={style.card}>
        <CardContent className={style['card-content']}>
          <Typography variant="h6">PDB information</Typography>
          <img src={imgSrc} alt={`3D view of the ${PDBAccession} structure`} />
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
              <div>Experimental method: {pdbData.expMethod.toLowerCase()}</div>
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
                Entities: {pdbData.nr_entities} - Residues:{' '}
                {pdbData.nr_residues} - Atoms: {pdbData.nr_atoms}
              </div>
              <div>
                Publication date:{' '}
                <time dateTime={publishDate.toISOString()}>
                  {publishDate.toDateString()}
                </time>
              </div>
              <div>
                Revision date:{' '}
                <time dateTime={revisionDate.toISOString()}>
                  {revisionDate.toDateString()}
                </time>
              </div>
            </div>
          )}
        </CardContent>
        <CardActions>
          <Button
            component={'a'}
            variant="contained"
            href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${PDBAccession}`}
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
            href={`https://www.rcsb.org/structure/${PDBAccession}`}
            size="small"
            color="primary"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Language />
            RCSB website
          </Button>
          {pdbData &&
            pdbData.pubmedId && (
              <Button
                component={'a'}
                variant="contained"
                href={`https://www.ncbi.nlm.nih.gov/pubmed/?term=${
                  pdbData.pubmedId
                }`}
                size="small"
                color="primary"
                target="_blank"
                rel="noreferrer noopener"
              >
                <LibraryBooks />
                publication on PubMed
              </Button>
            )}
        </CardActions>
      </Card>
    );
  }
}
