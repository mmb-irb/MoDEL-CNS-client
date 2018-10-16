import React, { PureComponent } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  List,
  ListItem,
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
    const PDBAccession = accessionToPDBAccession(
      this.props.match.params.accession,
    );
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
          <div>
            <Typography variant="h6">PDB information</Typography>
            {pdbData && (
              <List>
                <ListItem>{pdbData.title}</ListItem>
                <ListItem>
                  PDB Accession: {pdbData.structureId}
                  {pdbData.replaces && ` (replaces ${pdbData.replaces})`}
                </ListItem>
                {pdbData.status &&
                  pdbData.status !== 'CURRENT' &&
                  `Status: ${pdbData.status}`}
                <ListItem>
                  PDB Accession: {pdbData.structureId}
                  {pdbData.replaces && ` (replaces ${pdbData.replaces})`}
                </ListItem>
                <ListItem>
                  Experimental method: {pdbData.expMethod.toLowerCase()}
                </ListItem>
                <ListItem>
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
                </ListItem>
                <ListItem>
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
                </ListItem>
                <ListItem>
                  Entities: {pdbData.nr_entities} - Residues:{' '}
                  {pdbData.nr_residues} - Atoms: {pdbData.nr_atoms}
                </ListItem>
                <ListItem>
                  Publication date:{' '}
                  <time dateTime={publishDate.toISOString()}>
                    {publishDate.toDateString()}
                  </time>
                </ListItem>
                <ListItem>
                  Revision date:{' '}
                  <time dateTime={revisionDate.toISOString()}>
                    {revisionDate.toDateString()}
                  </time>
                </ListItem>
              </List>
            )}
          </div>
          <img
            src={`//cdn.rcsb.org/images/hd/${PDBAccession.substr(
              1,
              2,
            )}/${PDBAccession}/${PDBAccession}.0_chimera_tm_350_350.png`}
            alt={`3D view of the ${PDBAccession} structure`}
          />
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
