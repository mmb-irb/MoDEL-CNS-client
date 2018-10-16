const PDBExtractor = /^[a-z0-9]{4}/i;

export default accession => {
  const [PDBAccession] = accession.match(PDBExtractor) || [];
  return PDBAccession;
};
