import React, { PureComponent } from 'react';

export default class Overview extends PureComponent {
  async componentDidMount() {
    const response = await fetch(
      `https://www.rcsb.org/pdb/json/describePDB?structureId=${
        this.props.match.params.accession
      }`,
    );
    console.log(await response.json());
  }

  render() {
    return <span>overview</span>;
  }
}
