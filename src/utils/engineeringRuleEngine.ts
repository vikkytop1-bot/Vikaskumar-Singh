import { AnalysisResult, EngineeringCategory } from '../types/analysis';

export function analyzeEngineeringHeuristics(
  rawText: string,
  categoryInput: string,
  manualForm?: Record<string, any>
): AnalysisResult {
  const text = (rawText || '').toLowerCase();
  const form = manualForm || {};

  // Detect category if auto
  let category: EngineeringCategory = (categoryInput as EngineeringCategory) || 'Auto Detect';
  if (category === 'Auto Detect') {
    if (text.includes('solar') || text.includes('pv') || text.includes('battery') || text.includes('inverter') || text.includes('bess')) {
      category = 'Solar / Renewable Energy';
    } else if (text.includes('plc') || text.includes('scada') || text.includes('hmi') || text.includes('conveyor') || text.includes('automation')) {
      category = 'Automation / PLC';
    } else if (text.includes('pcb') || text.includes('schematic') || text.includes('stm32') || text.includes('esp32') || text.includes('microcontroller')) {
      category = 'PCB / Embedded Systems';
    } else if (text.includes('motor') || text.includes('starter') || text.includes('panel') || text.includes('transformer') || text.includes('voltage')) {
      category = 'Electrical';
    } else if (text.includes('gear') || text.includes('mechanism') || text.includes('cad') || text.includes('cylinder') || text.includes('pneumatic')) {
      category = 'Mechanical';
    } else {
      category = 'Mixed Engineering';
    }
  }

  // Detect explicit client confirmed data
  const electricalConfirmed: string[] = [];
  const electronicsConfirmed: string[] = [];
  const mechanicalConfirmed: string[] = [];
  const softwareControlConfirmed: string[] = [];
  const installationConfirmed: string[] = [];
  const commercialConfirmed: string[] = [];
  const timelineConfirmed: string[] = [];

  // Motor / Power detection
  const kwMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:kw|k\.w|kilowatt)/i);
  if (kwMatch) electricalConfirmed.push(`Rated power stated: ${kwMatch[1]} kW`);

  const hpMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:hp|horse\s*power)/i);
  if (hpMatch) electricalConfirmed.push(`Motor horsepower stated: ${hpMatch[1]} HP`);

  if (text.includes('motor')) electricalConfirmed.push('Motor drive unit specified');
  if (text.includes('pump')) electricalConfirmed.push('Pump load specified');
  if (text.includes('conveyor')) mechanicalConfirmed.push('Conveyor mechanical transport specified');
  if (text.includes('inverter')) electricalConfirmed.push('Inverter / power conversion equipment specified');
  if (text.includes('emergency stop') || text.includes('e-stop')) electricalConfirmed.push('Emergency stop safety device required');
  if (text.includes('automatic') || text.includes('automated')) softwareControlConfirmed.push('Automatic operation mode requested');
  if (text.includes('plc')) softwareControlConfirmed.push('PLC control architecture requested');
  if (text.includes('battery') || text.includes('bess') || text.includes('kwh')) electricalConfirmed.push('Battery energy storage specified');
  if (text.includes('pcb') || text.includes('layer')) electronicsConfirmed.push('PCB fabrication / hardware design required');

  if (form.clientName) commercialConfirmed.push(`Client contact: ${form.clientName}`);
  if (form.supplyVoltage) electricalConfirmed.push(`Supply voltage confirmed: ${form.supplyVoltage}`);
  if (form.phase) electricalConfirmed.push(`Phase supply confirmed: ${form.phase}`);
  if (form.deliveryDeadline) timelineConfirmed.push(`Target deadline: ${form.deliveryDeadline}`);

  // Detect conflicts (e.g. 5kW inverter vs 7.5kW motor)
  const conflicts: Array<{ conflict: string; whyProblem: string; requiredResolution: string }> = [];
  if (
    (text.includes('5 kw') || text.includes('5kw')) &&
    (text.includes('7.5 kw') || text.includes('7.5kw') || text.includes('10 hp') || text.includes('10hp'))
  ) {
    conflicts.push({
      conflict: '5 kW Inverter Capacity vs 7.5 kW (10 HP) Motor Load',
      whyProblem:
        'A 5 kW inverter cannot supply power to a 7.5 kW induction motor. Motor starting inrush will instantly trigger severe overcurrent tripping or inverter failure.',
      requiredResolution:
        'Install a dedicated Solar VFD pump controller (11 kW rated) or upgrade inverter system to 15kVA 3-phase.',
    });
  }

  // Detect missing information
  const missingInformation: Array<{ item: string; whyItMatters: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; category: string }> = [];

  const hasVoltage = text.includes('volt') || text.includes('400v') || text.includes('415v') || text.includes('230v') || text.includes('480v') || !!form.supplyVoltage;
  if (!hasVoltage) {
    missingInformation.push({
      item: 'Operating supply voltage, phase and frequency (e.g. 400V 3-phase 50Hz)',
      whyItMatters: 'Essential to size circuit breakers, contactor coils, and cable cross-sections.',
      priority: 'HIGH',
      category: 'Electrical',
    });
  }

  const hasFaultLevel = text.includes('fault') || text.includes('ka');
  if (!hasFaultLevel) {
    missingInformation.push({
      item: 'Prospective short-circuit fault current (kA rating) at main incoming point',
      whyItMatters: 'Protective switchgear must have certified breaking capacity to withstand short-circuit faults safely.',
      priority: 'HIGH',
      category: 'Electrical',
    });
  }

  const hasEnvironment = text.includes('ip') || text.includes('indoor') || text.includes('outdoor') || text.includes('ambient');
  if (!hasEnvironment) {
    missingInformation.push({
      item: 'Installation environment, ambient temperature and required enclosure IP rating',
      whyItMatters: 'Determines enclosure protection against water/dust, heating/cooling fans, and component derating.',
      priority: 'MEDIUM',
      category: 'Mechanical',
    });
  }

  missingInformation.push({
    item: 'Control philosophy details and preferred brand specifications (e.g. Siemens, ABB, Schneider)',
    whyItMatters: 'Directly impacts quotation cost, component lead time, and automation hardware selection.',
    priority: 'MEDIUM',
    category: 'Control/Automation',
  });

  missingInformation.push({
    item: 'Target delivery schedule and site commissioning readiness',
    whyItMatters: 'Critical to coordinate procurement lead times and allocate engineering resources.',
    priority: 'LOW',
    category: 'Commercial',
  });

  // Client questions
  const clientQuestions: Array<{ id: string; question: string; category: string; rationale: string }> = [
    {
      id: 'q1',
      question: 'What is the available electrical supply on site (e.g., 400V 3-phase 50Hz or 230V single-phase)?',
      category: 'Electrical',
      rationale: 'Needed to size main isolator, contactors, and protective relays.',
    },
    {
      id: 'q2',
      question: 'Could you confirm the full nameplate ratings (kW, HP, or full-load current) of all motors and connected equipment?',
      category: 'Equipment Ratings',
      rationale: 'Required to calculate total connected load and cable ampacities.',
    },
    {
      id: 'q3',
      question: 'How should the automatic sequence be initiated and stopped (e.g. float switches, pressure sensor, pushbuttons)?',
      category: 'Automation Logic',
      rationale: 'Defines control circuit wiring and programming requirements.',
    },
    {
      id: 'q4',
      question: 'Is a Programmable Logic Controller (PLC) with touch screen (HMI) required, or is standard relay logic acceptable?',
      category: 'Control System',
      rationale: 'Affects panel architecture, software development scope, and price.',
    },
    {
      id: 'q5',
      question: 'Will the equipment be installed indoors in a clean room, or outdoors subject to weather and temperature extremes?',
      category: 'Environment',
      rationale: 'Determines IP rating (IP54 vs IP65) and cooling ventilation requirements.',
    },
    {
      id: 'q6',
      question: 'What is your target delivery deadline for manufacturing and testing?',
      category: 'Commercial / Timeline',
      rationale: 'Helps schedule engineering fabrication and verify component availability.',
    },
  ];

  // Scope of Work
  const scopeOfWork: any[] = [
    {
      category: 'Engineering',
      description: 'Perform load schedule calculations, fault level verification, and cable sizing.',
      status: 'CONFIRMED',
    },
    {
      category: 'Design',
      description: 'Produce single line diagram (SLD), schematic wiring diagrams, and panel layout drawings.',
      status: 'CONFIRMED',
    },
    {
      category: 'Procurement',
      description: 'Procure enclosure, switchgear, protective relays, terminal blocks, and cabling.',
      status: 'CONFIRMED',
    },
    {
      category: 'Fabrication',
      description: 'Assemble mounting plate, route wiring trunking, terminate wiring, and label ferrules.',
      status: 'CONFIRMED',
    },
    {
      category: 'Programming',
      description: 'Develop PLC control logic and HMI graphics if PLC hardware is selected.',
      status: 'OPTIONAL / NEEDS CONFIRMATION',
    },
    {
      category: 'Testing',
      description: 'Factory Acceptance Testing (FAT), dielectric insulation resistance, and point-to-point continuity checks.',
      status: 'CONFIRMED',
    },
    {
      category: 'Installation',
      description: 'On-site mechanical wall/floor mounting and field cabling glanding.',
      status: 'OPTIONAL / NEEDS CONFIRMATION',
    },
    {
      category: 'Commissioning',
      description: 'Site cold and hot commissioning, motor rotation check, and full functional sequence test.',
      status: 'OPTIONAL / NEEDS CONFIRMATION',
    },
    {
      category: 'Documentation',
      description: 'Provide final as-built drawings, operations & maintenance (O&M) manual, and test certificates.',
      status: 'CONFIRMED',
    },
  ];

  // Preliminary BOQ
  const preliminaryBOQ: any[] = [
    {
      item: 'Main Enclosure',
      description: 'Industrial mild steel powder coated / stainless steel cubicle with mounting plate',
      specification: 'TBD (estimate IP55 min, sized to fit starters)',
      quantity: '1 No.',
      basis: 'Housing for electrical starters and controls',
      confidence: 'Medium',
    },
    {
      item: 'Incoming Main Isolator',
      description: 'Door-interlocked rotary switch disconnector',
      specification: 'TBD (estimate 63A - 100A 4-Pole based on confirmed load)',
      quantity: '1 No.',
      basis: 'Main safety electrical isolation standard',
      confidence: 'Medium',
    },
    {
      item: 'Primary Motor Starter Assembly',
      description: 'Star-Delta starter, Soft Starter or VFD with motor protection breaker',
      specification: kwMatch ? `Sized for ${kwMatch[1]} kW motor` : 'TBD (pending confirmed motor FLA)',
      quantity: '1 Set',
      basis: 'Client specified main motor requirement',
      confidence: kwMatch ? 'High' : 'Medium',
    },
    {
      item: 'Auxiliary Starter Units',
      description: 'Direct-on-line (DOL) contactors and thermal overload relays',
      specification: 'TBD (ratings pending client confirmation)',
      quantity: '2 Sets',
      basis: 'Client stated auxiliary pumps / conveyor',
      confidence: 'Medium',
    },
    {
      item: 'Emergency Stop Pushbutton Station',
      description: 'Twist-to-release 40mm red mushroom head pushbutton with 2NC safety contacts',
      specification: 'Cat 0/1 emergency stop compliant (ISO 13850)',
      quantity: '1 No.',
      basis: 'Explicit client requirement for emergency stop',
      confidence: 'High',
    },
    {
      item: 'Extra-Low Voltage Power Supply',
      description: 'Switch-mode power supply unit for control circuit',
      specification: '24V DC, 5A output, DIN-rail mounted',
      quantity: '1 No.',
      basis: 'Standard engineering safety practice for operator controls',
      confidence: 'High',
    },
  ];

  // Engineering Risks
  const risks: any[] = [
    {
      risk: 'Motor Starting Inrush Current & Upstream Voltage Sag',
      whyItMatters: 'Starting large motors direct-on-line (DOL) draws 6x-8x full load current, which can trip upstream breakers or dip plant voltage.',
      level: 'HIGH',
      mitigation: 'Verify upstream transformer capacity and consider Star-Delta, Soft Starter, or VFD starting.',
    },
    {
      risk: 'Prospective Fault Level / Short-Circuit Rating Unknown',
      whyItMatters: 'Using switchgear with inadequate kA breaking capacity poses catastrophic arc-flash and explosion risk under short circuit.',
      level: 'HIGH',
      mitigation: 'Obtain facility single line diagram or measure prospective short-circuit current at point of supply.',
    },
    {
      risk: 'Environmental Ambient Temperature & Heat Dissipation',
      whyItMatters: 'Enclosed motor starters generate substantial thermal losses; unventilated cubicles can cause nuisance thermal tripping.',
      level: 'MEDIUM',
      mitigation: 'Perform thermal dissipation calculation and install filtered ventilation fan if heat exceeds 15W/m2.',
    },
  ];

  // Assumptions
  const assumptions: any[] = [
    {
      assumption: 'Standard industrial 3-phase 400V 50Hz supply is available at the installation point.',
      basis: 'Standard industrial distribution voltage for motor loads above 3 kW.',
      riskIfWrong: 'Single phase supply would require complete redesign or rotary phase converter.',
    },
    {
      assumption: 'Motor duty cycle is standard continuous industrial service (S1 duty).',
      basis: 'Common baseline for standard water pumping and conveying skids.',
      riskIfWrong: 'Severe duty or frequent starting requires heavy-duty thermal derating.',
    },
    {
      assumption: 'Emergency stop circuit requires dual-channel safety monitoring relay.',
      basis: 'Current machinery safety standards (ISO 13849-1 / EN 60204-1).',
      riskIfWrong: 'Non-compliance with occupational safety audits.',
    },
  ];

  // Calculate completeness
  let overallPercentage = 45;
  if (electricalConfirmed.length > 2) overallPercentage += 15;
  if (hasVoltage) overallPercentage += 15;
  if (conflicts.length > 0) overallPercentage -= 10;
  if (form.clientName && form.projectTitle) overallPercentage += 10;
  overallPercentage = Math.min(Math.max(overallPercentage, 25), 85);

  let ratingLabel: any = 'Incomplete';
  if (overallPercentage < 40) ratingLabel = 'Very incomplete';
  else if (overallPercentage < 60) ratingLabel = 'Incomplete';
  else if (overallPercentage < 80) ratingLabel = 'Partially complete';
  else if (overallPercentage < 95) ratingLabel = 'Mostly complete';
  else ratingLabel = 'Ready for detailed quotation';

  const riskLevel = conflicts.length > 0 ? 'HIGH' : risks.some((r) => r.level === 'HIGH') ? 'HIGH' : 'MEDIUM';

  return {
    projectSummary: {
      title: form.projectTitle || (kwMatch ? `${kwMatch[1]} kW Motor & Automation Control System` : `${category} Requirement Analysis`),
      category,
      industry: form.industry || 'Industrial Automation & Process Engineering',
      clientObjective: form.projectObjective || 'Automate machinery coordination with safety controls.',
      overallSummary: `Client requirement analysis for ${category}. Key elements include motor drive controls, automated coordination, and safety emergency stopping. Critical electrical supply ratings and specific motor nameplate data must be confirmed before issuing a final quotation.`,
    },
    completeness: {
      overallPercentage,
      ratingLabel,
      categories: {
        technical: hasVoltage ? 60 : 35,
        electrical: kwMatch ? 65 : 40,
        mechanical: mechanicalConfirmed.length > 0 ? 55 : 30,
        controlAutomation: text.includes('automatic') ? 60 : 35,
        installation: hasEnvironment ? 60 : 25,
        commercial: form.budget ? 65 : 20,
        timeline: form.deliveryDeadline ? 70 : 15,
      },
    },
    confirmedRequirements: {
      electrical: electricalConfirmed,
      electronics: electronicsConfirmed,
      mechanical: mechanicalConfirmed,
      softwareControl: softwareControlConfirmed,
      installation: installationConfirmed,
      commercial: commercialConfirmed,
      timeline: timelineConfirmed,
    },
    missingInformation,
    clientQuestions,
    scopeOfWork,
    preliminaryBOQ,
    risks,
    conflicts,
    assumptions,
    feasibility: {
      status: conflicts.length > 0 ? 'Potential technical concern' : overallPercentage >= 70 ? 'Potentially feasible' : 'Needs further information',
      summary: conflicts.length > 0
        ? 'Technical conflict identified between power generation and connected load. Sizing must be resolved prior to quotation.'
        : 'Requirement is technically sound in concept but requires confirmation of missing supply voltage and equipment ratings.',
      engineeringReviewNotes: 'Advise client that final component pricing and physical panel sizing cannot be committed until motor full-load amperes and site voltage are confirmed.',
    },
    recommendedNextAction: conflicts.length > 0
      ? 'Alert client to the equipment sizing conflict and propose compatible power architecture.'
      : 'Send the client follow-up questions to obtain exact motor nameplates and available supply voltage before preparing a commercial quotation.',
  };
}
