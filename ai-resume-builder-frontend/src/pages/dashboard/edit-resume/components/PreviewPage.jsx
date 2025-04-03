import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PersonalDeatailPreview from "./preview-components/PersonalDeatailPreview";
import SummeryPreview from "./preview-components/SummaryPreview";
import ExperiencePreview from "./preview-components/ExperiencePreview";
import EducationalPreview from "./preview-components/EducationalPreview";
import SkillsPreview from "./preview-components/SkillsPreview";
import ProjectPreview from "./preview-components/ProjectPreview";

function PreviewPage() {
  const resumeData = useSelector((state) => state.editResume.resumeData);

  useEffect(() => {
    console.log("PreviewPage rendered ");
  }, [resumeData]);

  // Function to generate and download a Word document
  const generateWordDoc = () => {
    const experienceText = resumeData?.experience
      ? resumeData.experience
          .map((exp, index) => `(${index + 1}) ${exp.company} - ${exp.role}`)
          .join("\n")
      : "N/A";

    const projectText = resumeData?.projects
      ? resumeData.projects
          .map(
            (proj, index) =>
              `(${index + 1}) ${proj.title} - ${proj.description}`
          )
          .join("\n")
      : "N/A";

    const skillsText = resumeData?.skills
      ? resumeData.skills.join(", ")
      : "N/A";

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Resume", bold: true, size: 32 }),
                new TextRun("\n\n"),
                new TextRun(`Name: ${resumeData?.personalDetails?.name || ""}`),
                new TextRun("\n"),
                new TextRun(`Email: ${resumeData?.personalDetails?.email || ""}`),
                new TextRun("\n\n"),
                new TextRun({ text: "Experience:", bold: true }),
                new TextRun("\n"),
                new TextRun(experienceText),
                new TextRun("\n\n"),
                new TextRun({ text: "Projects:", bold: true }),
                new TextRun("\n"),
                new TextRun(projectText),
                new TextRun("\n\n"),
                new TextRun({ text: "Skills:", bold: true }),
                new TextRun("\n"),
                new TextRun(skillsText),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Resume.docx");
    });
  };

  // Function to generate and directly download a PDF
  const generatePDF = () => {
    const element = document.getElementById("resume-preview");
    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      pdf.save("Resume.pdf"); // Directly downloads the file
    });
  };

  return (
    <div>
      {/* Resume Preview Section */}
      <div
        id="resume-preview"
        className="shadow-lg h-full p-14 border-t-[20px]"
        style={{
          borderColor: resumeData?.themeColor ? resumeData.themeColor : "#000000",
        }}
      >
        <PersonalDeatailPreview resumeInfo={resumeData} />
        <SummeryPreview resumeInfo={resumeData} />
        {resumeData?.experience && <ExperiencePreview resumeInfo={resumeData} />}
        {resumeData?.projects && <ProjectPreview resumeInfo={resumeData} />}
        {resumeData?.education && <EducationalPreview resumeInfo={resumeData} />}
        {resumeData?.skills && <SkillsPreview resumeInfo={resumeData} />}
      </div>

      {/* Buttons for Downloading
      <div className="flex gap-4 mt-4">
        <button onClick={generateWordDoc} className="bg-blue-500 text-white p-2 rounded">
          Download as Word
        </button>
        <button onClick={generatePDF} className="bg-red-500 text-white p-2 rounded">
          Download as PDF
        </button>
      </div> */}
    </div>
  );
}

export default PreviewPage;
