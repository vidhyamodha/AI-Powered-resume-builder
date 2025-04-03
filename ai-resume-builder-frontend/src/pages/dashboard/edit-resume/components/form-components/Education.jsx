import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { updateThisResume } from "@/Services/resumeAPI";
import { toast } from "sonner";

const formFields = {
  universityName: "",
  degree: "",
  major: "",
  grade: "",
  gradeType: "CGPA",
  startDate: "",
  endDate: "",
  currentlyPursuing: false, // New field
  description: "",
};

function Education({ resumeInfo }) {
  const [educationalList, setEducationalList] = React.useState(
    resumeInfo?.education || [{ ...formFields }]
  );
  const { resume_id } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    dispatch(addResumeData({ ...resumeInfo, education: educationalList }));
  }, [educationalList]);

  const AddNewEducation = () => {
    setEducationalList([...educationalList, { ...formFields }]);
  };

  const RemoveEducation = () => {
    setEducationalList((list) => list.slice(0, -1));
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const list = [...educationalList];

    // Handle checkbox separately
    if (type === "checkbox") {
      list[index] = {
        ...list[index],
        currentlyPursuing: checked,
        endDate: checked ? "" : list[index].endDate, // Clear endDate if checked
      };
    } else {
      list[index] = { ...list[index], [name]: value };
    }

    setEducationalList(list);
  };

  const onSave = () => {
    if (educationalList.length === 0) {
      return toast("Please add at least one education", "error");
    }
    setLoading(true);

    const data = {
      data: { education: educationalList },
    };

    if (resume_id) {
      updateThisResume(resume_id, data)
        .then(() => toast("Resume Updated", "success"))
        .catch((error) => toast("Error updating resume", `${error.message}`))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Education</h2>
      <p>Add Your educational details</p>

      {educationalList.map((item, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
          <div className="col-span-2">
            <label>University Name</label>
            <Input name="universityName" onChange={(e) => handleChange(e, index)} value={item.universityName} />
          </div>
          <div>
            <label>Degree</label>
            <Input name="degree" onChange={(e) => handleChange(e, index)} value={item.degree} />
          </div>
          <div>
            <label>Major</label>
            <Input name="major" onChange={(e) => handleChange(e, index)} value={item.major} />
          </div>
          <div>
            <label>Start Date</label>
            <Input type="date" name="startDate" onChange={(e) => handleChange(e, index)} value={item.startDate} />
          </div>
          <div>
            <label>End Date</label>
            <Input
              type="date"
              name="endDate"
              onChange={(e) => handleChange(e, index)}
              value={item.endDate}
              disabled={item.currentlyPursuing} // Disable if currently pursuing
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="currentlyPursuing"
              checked={item.currentlyPursuing}
              onChange={(e) => handleChange(e, index)}
            />
            <label>Currently Pursuing</label>
          </div>
          <div className="col-span-2">
            <label>Grade</label>
            <div className="flex items-center gap-4">
              <select name="gradeType" className="py-2 px-4 rounded-md" onChange={(e) => handleChange(e, index)} value={item.gradeType}>
                <option value="CGPA">CGPA</option>
                <option value="GPA">GPA</option>
                <option value="Percentage">Percentage</option>
              </select>
              <Input type="text" name="grade" onChange={(e) => handleChange(e, index)} value={item.grade} />
            </div>
          </div>
          <div className="col-span-2">
            <label>Description</label>
            <Textarea name="description" onChange={(e) => handleChange(e, index)} value={item.description} />
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewEducation} className="text-primary">+ Add More Education</Button>
          <Button variant="outline" onClick={RemoveEducation} className="text-primary">- Remove</Button>
        </div>
        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default Education;
