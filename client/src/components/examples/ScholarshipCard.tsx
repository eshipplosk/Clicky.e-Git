import { ScholarshipCard } from '../ScholarshipCard';

export default function ScholarshipCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <ScholarshipCard
        id="1"
        title="STEM Excellence Scholarship"
        amount={5000}
        deadline="March 15, 2025"
        category="STEM"
        eligibility="GPA 3.5+ in STEM major"
        matchScore={92}
        description="Supporting outstanding students pursuing degrees in Science, Technology, Engineering, and Mathematics fields."
        onClick={() => console.log('Scholarship clicked')}
      />
    </div>
  );
}
