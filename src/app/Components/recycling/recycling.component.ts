import { Component } from '@angular/core';

@Component({
  selector: 'app-recycling',
  templateUrl: './recycling.component.html',
  styleUrl: './recycling.component.css'
})
export class RecyclingComponent {
  paperGuidelines = {
    newspapers: {
      title: 'Newspapers and Magazines',
      guidelines: [
        'Ensure they are dry and free from food residue',
        'Remove plastic wrapping if any'
      ]
    },
    officePaper: {
      title: 'Office Paper and Envelopes',
      guidelines: [
        'Avoid recycling shredded paper (may require special handling)',
        'Remove staples, paper clips, or metal fasteners'
      ]
    },
    cardboard: {
      title: 'Cardboard Boxes',
      guidelines: [
        'Flatten boxes to save space',
        'Remove tape or labels if possible'
      ]
    },
    paperBags: {
      title: 'Paper Bags',
      guidelines: [
        'Recycle clean, dry paper bags without food stains'
      ]
    }
  };

  plasticGuidelines = {
    acceptedTypes: {
      type1: {
        code: '#1 (PET)',
        examples: ['Water bottles', 'Soda bottles']
      },
      type2: {
        code: '#2 (HDPE)',
        examples: ['Milk jugs', 'Detergent containers', 'Shampoo bottles']
      }
    },
    preparationTips: [
      'Check local recycling symbols on plastic items',
      'Rinse containers to remove food and liquid residue',
      'Remove caps or lids if they are not recyclable',
      'Avoid recycling plastic bags unless your facility accepts them separately'
    ]
  };

  glassGuidelines = {
    accepted: {
      title: 'Accepted Glass',
      guidelines: [
        'Recycle bottles and jars without lids',
        'Ensure containers are thoroughly rinsed to remove residue'
      ]
    },
    nonRecyclable: {
      title: 'Non-Recyclable Glass',
      guidelines: [
        'Do not recycle broken glass, mirrors, or ceramics (may require special handling)'
      ]
    }
  };

  aluminumGuidelines = {
    cans: {
      title: 'Aluminum Cans',
      guidelines: [
        'Rinse thoroughly to remove food or liquid residue',
        'Flatten cans to save space if allowed by the facility'
      ]
    },
    foilAndTrays: {
      title: 'Aluminum Foil and Trays',
      guidelines: [
        'Recycle only if they are clean and free from food grease'
      ]
    }
  };
}
