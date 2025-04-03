import React, { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AIChatSession } from "@/Services/AiModel";
import { updateThisResume } from "@/Services/resumeAPI";

const prompt =
  "Job Title: {jobTitle}, Provide a list of summaries for 3 experience levels: Entry, Mid, and Senior, each in 3-4 lines, formatted as an array of objects with 'summary' and 'experience_level' fields in JSON format.";

function Summary({ resumeInfo, enanbledNext, enanbledPrev }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(resumeInfo?.summary || "");
  const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState([]);
  const { resume_id } = useParams();

  const handleInputChange = (e) => {
    enanbledNext(false);
    enanbledPrev(false);
    dispatch(addResumeData({ ...resumeInfo, [e.target.name]: e.target.value }));
    setSummary(e.target.value);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (resume_id) {
        await updateThisResume(resume_id, { data: { summary } });
        toast("Resume Updated", { type: "success" });
      }
      enanbledNext(true);
      enanbledPrev(true);
    } catch (error) {
      toast("Error updating resume", { type: "error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const setSummery = (summary) => {
    dispatch(addResumeData({ ...resumeInfo, summary }));
    setSummary(summary);
  };

  const GenerateSummeryFromAI = async () => {
    setLoading(true);
    if (!resumeInfo?.jobTitle) {
      toast("Please Add Job Title", { type: "warning" });
      setLoading(false);
      return;
    }

    const PROMPT = prompt.replace("{jobTitle}", resumeInfo?.jobTitle);
    try {
      const result = await AIChatSession.sendMessage(PROMPT);
      const responseText = await result.response.text();
      const parsedData = JSON.parse(responseText);

      if (Array.isArray(parsedData)) {
        setAiGenerateSummeryList(parsedData);
        toast("Summary Generated", { type: "success" });
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      toast("Error generating summary", { type: "error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Summary</h2>
        <p>Add a summary for your job title.</p>

        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Add Summary</label>
            <Button
              variant="outline"
              onClick={GenerateSummeryFromAI}
              type="button"
              size="sm"
              className="border-primary text-primary flex gap-2"
            >
              <Sparkles className="h-4 w-4" /> Generate from AI
            </Button>
          </div>
          <Textarea
            name="summary"
            className="mt-5"
            required
            value={summary}
            onChange={handleInputChange}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummeryList.length > 0 && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSummeryList.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                enanbledNext(false);
                enanbledPrev(false);
                setSummery(item?.summary);
              }}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <h2 className="font-bold my-1 text-primary">
                Level: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Summary;
