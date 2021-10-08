// React logic
import React from 'react';

import {
  faStepBackward,
  faStepForward,
  faPause,
  faPlay,
  faExpand,
  faCompress,
  faSyncAlt,
  faVideo,
  faAdjust,
  faCube,
  faTimes,
  faLock,
  faUnlock,
  faPaintBrush,
  faWalking,
  faRunning,
  faBiking,
} from '@fortawesome/free-solid-svg-icons';
import {
  faDotCircle,
  faImages,
  faSquare,
} from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Icon } from '@material-ui/core';

// Ser a simpler link component
const Link = ({ name, id, url }) => (
  <>
    <a
      href={id ? `/help#/help#${id}` : url}
      target="_blank"
      rel="noreferrer noopener"
    >
      {name}
    </a>
  </>
);

// All text to be displayed is set previously here
export const documentation = [
  {
    id: 'introduction',
    title: 'Introduction',
    body: (
      <>
        Welcome to the MoDEL-CNS documentation page.
        <br />
        <br />
        MoDEL-CNS is an open platform designed to provide web-access to
        molecular dynamics (MD) simulations from or related to the Central
        Nervous System (CNS).
        <br />
        <br />
        For any doubt please contact{' '}
        <a href="mailto:daniel.beltran@irbbarcelona.org">
          daniel.beltran@irbbarcelona.org
        </a>
      </>
    ),
    children: [
      {
        id: 'context',
        header: 'Context',
        body: (
          <>
            MoDEL-CNS is supported by the{' '}
            <Link
              name={'Human Brain Project'}
              url={'https://www.humanbrainproject.eu/en/'}
            />{' '}
            and the <Link name={'CECH'} url={'https://www.upf.edu/web/cech'} />.
            The platform is being developed from the{' '}
            <Link
              name={'Molecular Modeling and Bioinformatics'}
              url={'http://mmb.irbbarcelona.org/www/'}
            />{' '}
            group at{' '}
            <Link
              name={'IRB Barcelona'}
              url={'https://www.irbbarcelona.org/en'}
            />{' '}
            .
          </>
        ),
      },
      {
        id: 'source',
        header: 'Data source',
        body: (
          <>
            Simulations in MoDEL-CNS were run here in the{' '}
            <Link
              name={'Molecular Modeling and Bioinformatics'}
              url={'http://mmb.irbbarcelona.org/www/'}
            />{' '}
            group.
          </>
        ),
      },
      {
        id: 'processing',
        header: 'Data processing',
        body: (
          <>
            Before a simulation is uploaded to the MoDEL-CNS database, it is
            processed through a workflow. This workflow standarizes data format
            and then analyzes the simulation in order to upload the analysis
            results also to the database. Some important aspects of this
          </>
        ),
      },
    ],
  },

  {
    id: 'features',
    title: 'Features',
    children: [
      {
        id: 'browser',
        header: 'Browser',
        body: (
          <>
            Browser is useful to search a specific simulation when you know what
            you are looking for
            <br />
            <br />
            Browser searches the database by any total or partial coincidence
            with the accesion number, simulation name, description, author or
            group names.
            <br />
            <br />
            In addition, internal accesions may be used to search a simulation.
            In this case the id must be whole, not partial.
          </>
        ),
        text:
          'Use the browser to search a specific simulation by its accesion number, name, description, author or group names. Any total or partial coincidence works.',
      },
      {
        id: 'overview',
        header: 'Overview page',
        body: (
          <>
            Data in this page is mostly provided by the simulation authors.
            Additional details about the original pdb structure are mined from
            the <Link name={'PDB web page'} url={'https://www.rcsb.org/'} />.
          </>
        ),
        page: (
          <>
            This is the overview page.
            <br />
            <br />
            Data in this page may include the name and description of the
            simulation, author and group names, type of simulation, program
            which carried the simulation and its version, original structure PDB
            data, ligand references to DrugBank and ChEMBL, contact details and
            links to the simulation sources, license and citation.
          </>
        ),
      },
      {
        id: 'trajectory',
        header: 'Trajectory page',
        body: (
          <>
            The trajectory displayed in the{' '}
            <Link name={'viewer'} id={'ngl-viewer'} /> is a subset of frames
            from the project main trajectory (25 frames by default). Loading all
            frames is not allowed for performance reasons.
            <br />
            <br />
            Some metadata values are mined from the topology and trajectory
            files while others are supplied by the authors.
            <br />
            <br />
            The protein functional analysis contains the families, domains, and
            sites, that an <Link name={'InterProScan'} id={'interpro'} />{' '}
            analysis revealed for each of the chain sequences. This is a
            prediction that might be helpful to discover functions, or to find
            similar structures for example.
          </>
        ),
        page: (
          <>
            This is the trajectory page.
            <br />
            <br />
            Above there is the trajectory metadata menu. Click in the title to
            drop a table with metadata values. Hover any data field with the
            mouse to show a brief title.
            <br />
            <br />
            The{' '}
            <a
              href="/help#/help#ngl-viewer"
              target="_blank"
              rel="noreferrer noopener"
            >
              viewer
            </a>{' '}
            below displays the main simulation dinamically and interactively.
            Use the mouse inside the NGL window to move, rotate or zoom the
            camera. You can get topology data of any atom by placing the mouse
            over it. Also some controls ara available under the NGL viewer in
            order to play/pause the trajectory, go fullscreen or change the
            viewer settings. Place the mouse over any button to show a summary
            title. Note that this is not the whole trajectory, but a small
            subset of frames picked along the trajectory. You can modify the
            number of frames to be loaded from the settings menu.
            <br />
            <br />
            Below the viewer there is the protein functional analysis.
            Recognized families, domains, and sites are displayed. You can
            interact with this visualisation as such:
            <br />
            <strong>Hover over their representation</strong> to see that some of
            them will have a corresponding page on the{' '}
            <a
              href="https://www.ebi.ac.uk/interpro/"
              target="_blank"
              rel="noreferrer noopener"
            >
              InterPro website
            </a>{' '}
            where you will be able to learn more about it.
            <br />
            <strong>Click on them</strong> to see the corresponding sequence
            highlighted in the viewer above. Clicking on an other entity within
            the same chain will change the highlight to that other entity.
            <br />
            <strong>Click on an empty space</strong> in this visualisation to
            remove the highlight for that chain.
            <br />
            <strong>Scroll over the visualisation</strong> to zoom in or out of
            the chain sequence. Alternatively, you can also interact with the
            top navigation part (at the top of each visualisation) to zoom in
            and out or to move within the sequence.
          </>
        ),
      },
      {
        id: 'ngl-viewer',
        header: 'NGL viewer',
        body: (
          <>
            NGL Viewer is a collection of tools for web-based molecular
            graphics.
            <br />
            <br />
            The BioExcel implementation of NGL viewer is a dynamic component
            useful to represent molecular structures and trajectories which the
            user can interact with.
            <br />
            <br />
            This component may be integrated in the web page structure (e.g. in
            the "trajectory" sheet) or an independent pop-up window which is
            draggable and resizable. To do so, hold left click in the window
            borders and drag.
            <br />
            <br />
            Use the mouse inside the NGL window to move the camera (hold right
            click), rotate the camera around its focus (hold left click) or zoom
            the camera (mouse wheel). Hover any atom with the mouse to get extra
            topology data (residue type and number, atom type and chain id) or
            left click on any atom to make the camera focus on it.
            <br />
            <br />
            Also some controls ara available under the NGL viewer in order to
            change other parameters:
            <br />
            <Icon>
              <FontAwesomeIcon icon={faTimes} />
            </Icon>{' '}
            (Only in pop-up) The "close" button is used to remove the whole NGL
            viewer pop-up window.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faUnlock} />
            </Icon>
            {' / '}
            <Icon color="disabled">
              <FontAwesomeIcon icon={faLock} />
            </Icon>{' '}
            (Only in pop-up) The "lock" button is used to make the current NGL
            viewer pop-up window stay as it is. So when a new selection is
            requested a new NGL window is opened instead of updating the locked
            window.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faStepBackward} />
            </Icon>
            {', '}
            <Icon>
              <FontAwesomeIcon icon={faStepForward} />
            </Icon>{' '}
            (Only with trajectory data) The "Previous frame" and "Next frame"
            buttons respectively are used to move through trajectory frames one
            by one.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faPlay} />
            </Icon>
            {' / '}
            <Icon>
              <FontAwesomeIcon icon={faPause} />
            </Icon>{' '}
            (Only with trajectory data) The "Play / Pause" button is used to
            start or stop the trajectory animation.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faExpand} />
            </Icon>
            {' / '}
            <Icon>
              <FontAwesomeIcon icon={faCompress} />
            </Icon>{' '}
            The "Enter / Exit full screen" button is used to make the NGL window
            expand to full screen or compress back to its normal size. User can
            also press "Esc" key to exit the full screen mode.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faSyncAlt} />
            </Icon>{' '}
            The "Toogle spin" button is used to make the camera slowly rotate
            around the y-axis.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faDotCircle} />
            </Icon>{' '}
            The "Center focus" button is used to make the camera return to its
            original focus.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faImages} />
            </Icon>
            {' / '}
            <Icon>
              <FontAwesomeIcon icon={faVideo} />
            </Icon>{' '}
            (Only with trajectory data) The "Smooth interpolation" button is
            used to smooth the jump between frames by adding extra frames
            in-between where the atom positions are interpolated.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faAdjust} />
            </Icon>{' '}
            The "Invert background color" button is used to switch background
            color between black and white.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faSquare} />
            </Icon>
            {' / '}
            <Icon>
              <FontAwesomeIcon icon={faCube} />
            </Icon>{' '}
            The "Orthographic / Perspective" button is used to change the view
            mode between 2D projection (orthographic or isometric) and 3D
            projection (perspective).
            <br />
            <Icon>
              <FontAwesomeIcon icon={faPaintBrush} />
            </Icon>{' '}
            The "Painter" button is used to set the drawing and coloring methods
            and the opacity of each representation.
            <br />
            <Icon>
              <FontAwesomeIcon icon={faWalking} />
            </Icon>
            {' / '}
            <Icon>
              <FontAwesomeIcon icon={faRunning} />
            </Icon>
            {' / '}
            <Icon>
              <FontAwesomeIcon icon={faBiking} />
            </Icon>{' '}
            The "Speed" bar is used to set how fast is the trajectory animation.
            <br />
            * Hover any button in the NGL window with the mouse to show a
            summary title.
            <br />
            <br />
            For more information about the original project, please check the
            oficial{' '}
            <a
              href="http://nglviewer.org/"
              target="_blank"
              rel="noreferrer noopener"
            >
              NGL viewer web page
            </a>
            .
          </>
        ),
      },
    ],
  },

  {
    id: 'analyses',
    title: 'Analyses',
    children: [
      {
        id: 'rmsd',
        header: 'RMSd',
        body: (
          <>
            RMSD analysis has been run against the first frame using only
            protein atoms. The RMSd value of the sturcutre is stored for all
            frames along the trajectory.
            <br />
            <br />
            This analysis is powered by <Link name={'Gromacs'} id={'gromacs'} />
            .
          </>
        ),
      },
      {
        id: 'rgyr',
        header: 'Radius of gyration',
        body: (
          <>
            The radius of gyration analysis computes the radius of gyration of a
            molecule and the radii of gyration about the x-, y- and z-axes, as a
            function of time. The atoms are explicitly mass weighted. This
            analysis is performed for all frames along the trajectory.
            <br />
            <br />
            This analysis is powered by <Link name={'Gromacs'} id={'gromacs'} />
            .
          </>
        ),
      },
      {
        id: 'fluctuation',
        header: 'Fluctuation',
        body: (
          <>
            The fluctuation analysis computes the RMSF (Root Mean Square
            Fluctuation, i.e. standard deviation) of atomic positions along the
            whole trajectory after fitting to the first frame.
            <br />
            <br />
            This analysis is powered by <Link name={'Gromacs'} id={'gromacs'} />
            .
          </>
        ),
      },
      {
        id: 'pca',
        header: 'PCA',
        body: (
          <>
            PCA (Principal Component Analysis) calculates and diagonalizes the
            (mass-weighted) covariance matrix from up to 2000 frames along the
            trajectory in order to obtain eigenvectors. Then the relevant
            eigenvectors (greater than 1% explained variance) are analyzed thus
            generating a projection of the trajectory 20 frames long for each
            one. Note that PCA analysis is performed only with backbone atoms
            for performance reasons.
            <br />
            <br />
            This analysis is powered by <Link name={'Gromacs'} id={'gromacs'} />
            .
          </>
        ),
      },
    ],
  },

  {
    id: 'bibliography',
    title: 'Bibliography',
    children: [
      {
        id: 'gromacs',
        header: 'Gromacs',
        body: (
          <>
            H. Bekker, H.J.C. Berendsen, E.J. Dijkstra, S. Achterop, R. van
            Drunen, D. van der Spoel, A. Sijbers, and H. Keegstra et al.,
            “Gromacs: A parallel computer for molecular dynamics simulations”;
            pp. 252–256 in Physics computing 92. Edited by R.A. de Groot and J.
            Nadrchal. World Scientific, Singapore, 1993.
            <br />
            <br />
            H.J.C. Berendsen, D. van der Spoel, and R. van Drunen, “GROMACS: A
            message-passing parallel molecular dynamics implementation,” Comp.
            Phys. Comm., 91 43–56 (1995).
            <br />
            <br />
            E. Lindahl, B. Hess, and D. van der Spoel, “GROMACS 3.0: A package
            for molecular simulation and trajectory analysis,” J. Mol. Mod., 7
            306–317 (2001).
            <br />
            <br />
            D. van der Spoel, E. Lindahl, B. Hess, G. Groenhof, A.E. Mark, and
            H.J.C. Berendsen, “GROMACS: Fast, Flexible and Free,” J. Comp.
            Chem., 26 1701–1718 (2005).
            <br />
            <br />
            B. Hess, C. Kutzner, D. van der Spoel, and E. Lindahl, “GROMACS 4:
            Algorithms for Highly Efficient, Load-Balanced, and Scalable
            Molecular Simulation,” J. Chem. Theory Comput., 4 [3] 435–447
            (2008).
            <br />
            <br />
            S. Pronk, S. Páll, R. Schulz, P. Larsson, P. Bjelkmar, R. Apostolov,
            M.R. Shirts, and J.C. Smith et al., “GROMACS 4.5: A high-throughput
            and highly parallel open source molecular simulation toolkit,”
            Bioinformatics, 29 [7] 845–854 (2013).
            <br />
            <br />
            S. Páll, M.J. Abraham, C. Kutzner, B. Hess, and E. Lindahl,
            “Tackling exascale software challenges in molecular dynamics
            simulations with GROMACS”; pp. 3–27 in Solving software challenges
            for exascale. Edited by S. Markidis and E. Laure. Springer
            International Publishing Switzerland, London, 2015.
            <br />
            <br />
            M.J. Abraham, T. Murtola, R. Schulz, S. Páll, J.C. Smith, B. Hess,
            and E. Lindahl, “GROMACS: High performance molecular simulations
            through multi-level parallelism from laptops to supercomputers,”
            SoftwareX, 1–2 19–25 (2015).
          </>
        ),
      },
      {
        id: 'interpro',
        header: 'InterPro',
        body: (
          <>
            Blum M, Chang H, Chuguransky S, Grego T, Kandasaamy S, Mitchell A,
            Nuka G, Paysan-Lafosse T, Qureshi M, Raj S, RichardsonL, Salazar GA,
            Williams L, Bork P, Bridge A, Gough J, Haft DH, Letunic I,
            Marchler-Bauer A, Mi H, Natale DA, Necci M, Orengo CA, Pandurangan
            AP, Rivoire C, Sigrist CJA, Sillitoe I, Thanki N, Thomas PD, Tosatto
            SCE, Wu CH, Bateman A and Finn RD The InterPro protein families and
            domains database: 20 years on. Nucleic Acids Research, Nov 2020,
            (doi: 10.1093/nar/gkaa977)
          </>
        ),
      },
    ],
  },
];

// Get all blocks, including parent and children documentation blocks, in a single array
export const docs = documentation.reduce((previous, current) => {
  previous.push(current);
  current.children && current.children.forEach(child => previous.push(child));
  return previous;
}, []);
