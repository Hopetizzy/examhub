import { Subject } from '../types';

export interface SyllabusTopic {
  name: string;
  subtopics: string[];
}

export const JAMB_SYLLABUS_2025: Record<Subject, SyllabusTopic[]> = {
  Mathematics: [
    {
      name: 'Number and Numeration',
      subtopics: ['Number Bases', 'Fractions, Decimals, Approximations and Percentages', 'Indices, Logarithms and Surds', 'Sets']
    },
    {
      name: 'Algebra',
      subtopics: ['Polynomials', 'Variation', 'Inequalities', 'Progression (AP & GP)', 'Binary Operations', 'Matrices and Determinants']
    },
    {
      name: 'Geometry & Trigonometry',
      subtopics: ['Euclidean Geometry', 'Mensuration', 'Locus', 'Coordinate Geometry', 'Trigonometric Ratios & Identities']
    },
    {
      name: 'Calculus',
      subtopics: ['Differentiation (Algebraic & Trigonometric)', 'Application of Differentiation (Rate of change, Maxima/Minima)', 'Integration (Area under curves)']
    },
    {
      name: 'Statistics',
      subtopics: ['Representation of Data', 'Measures of Location (Mean, Median, Mode)', 'Measures of Dispersion', 'Permutation & Combination', 'Probability']
    }
  ],
  English: [
    {
      name: 'Lexis and Structure',
      subtopics: ['Synonyms', 'Antonyms', 'Homonyms', 'Clause Patterns', 'Sentence Types', 'Tense', 'Concord', 'Modals']
    },
    {
      name: 'Oral English',
      subtopics: ['Vowels (Monophthongs & Diphthongs)', 'Consonants', 'Stress Patterns (Word & Sentence)', 'Intonation']
    },
    {
      name: 'Comprehension',
      subtopics: ['Reading for Main Idea', 'Reading for Details', 'Reading for Interpretation', 'Reading for Critical Evaluation']
    }
  ],
  Physics: [
    {
      name: 'Measurements and Units',
      subtopics: ['Fundamental and Derived Quantities', 'Dimensions', 'Measurement Errors']
    },
    {
      name: 'Motion and Force',
      subtopics: ['Scalar and Vectors', 'Kinematics', 'Projectiles', 'Newton\'s Laws', 'Equilibrium of Forces']
    },
    {
      name: 'Energy',
      subtopics: ['Work, Energy and Power', 'Heat Energy', 'Electric Energy']
    },
    {
      name: 'Waves',
      subtopics: ['Production and Propagation', 'Light Waves', 'Sound Waves', 'Electromagnetic Spectrum']
    },
    {
      name: 'Electricity and Magnetism',
      subtopics: ['Electrostatics', 'Current Electricity', 'Magnets and Magnetic Fields', 'Electromagnetic Induction']
    }
  ],
  Chemistry: [
    {
      name: 'Separation of Mixtures',
      subtopics: ['Sieving', 'Decantation', 'Filtration', 'Crystallization', 'Distillation']
    },
    {
      name: 'Chemical Combination',
      subtopics: ['Stoichiometry', 'Laws of Chemical Combination', 'Chemical Equations']
    },
    {
      name: 'States of Matter',
      subtopics: ['Kinetic Theory', 'Gas Laws (Boyle, Charles, Dalton)', 'Liquids and Solids']
    },
    {
      name: 'Atomic Structure',
      subtopics: ['Protons, Neutrons, Electrons', 'Isotopy', 'Electronic Configuration', 'Periodic Table']
    },
    {
      name: 'Organic Chemistry',
      subtopics: ['Hydrocarbons (Alkanes, Alkenes, Alkynes)', 'Alkanols', 'Alkanoic Acids', 'Soaps and Detergents']
    }
  ],
  Biology: [
    {
      name: 'Variety of Organisms',
      subtopics: ['Living vs Non-living', 'Classification of Living Things', 'Kingdoms']
    },
    {
      name: 'Form and Function',
      subtopics: ['Internal Structure of Plants/Animals', 'Nutrition', 'Transport System', 'Respiration', 'Excretion']
    },
    {
      name: 'Ecology',
      subtopics: ['Ecosystems', 'Ecological Management', 'Tolerance', 'Adaptation', 'Pollution']
    },
    {
      name: 'Heredity and Evolution',
      subtopics: ['Genetics (Mendel\'s Laws)', 'Chromosome Theory', 'Evolution Theories']
    }
  ],
  Government: [
    {
      name: 'Basic Concepts',
      subtopics: ['Power', 'Authority', 'Legitimacy', 'Sovereignty', 'Democracy', 'Political Culture']
    },
    {
      name: 'Political Representation',
      subtopics: ['Political Parties', 'Elections', 'Pressure Groups', 'Public Opinion']
    },
    {
      name: 'Public Administration',
      subtopics: ['Civil Service', 'Public Corporations', 'Local Government']
    }
  ],
  Economics: [
    {
      name: 'Basic Economic Concepts',
      subtopics: ['Scarcity', 'Choice', 'Scale of Preference', 'Opportunity Cost']
    },
    {
      name: 'Economic Systems',
      subtopics: ['Capitalism', 'Socialism', 'Mixed Economy']
    },
    {
      name: 'Production',
      subtopics: ['Factors of Production', 'Division of Labour', 'Scale of Production']
    },
    {
      name: 'Market Structures',
      subtopics: ['Pure Competition', 'Monopoly', 'Monopolistic Competition', 'Oligopoly']
    }
  ],
  'Civic Education': [
    {
      name: 'Citizenship',
      subtopics: ['Rights and Duties', 'National Identity', 'Democracy']
    },
    {
      name: 'The Constitution',
      subtopics: ['Features', 'History', 'Rule of Law']
    }
  ]
};

export const WAEC_SYLLABUS_2026 = JAMB_SYLLABUS_2025; // WAEC Syllabus largely overlaps with JAMB for these core subjects
