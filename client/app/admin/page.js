"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, getToken } from "../../lib/auth";

const CAMPUS_DATA = {
  "EC Campus": [
    { name: "Computer Science", url: "https://staff.pes.edu/ec/atoz/computer-science/" },
    { name: "Computer Science (AIML)", url: "https://staff.pes.edu/ec/atoz/computer-science-AIML/" },
    { name: "Electronics & Communications", url: "https://staff.pes.edu/ec/atoz/electronics-&-communications/" },
    { name: "Mechanical", url: "https://staff.pes.edu/ec/atoz/mechanical/" },
    { name: "Management Studies", url: "https://staff.pes.edu/ec/atoz/management-studies/" },
    { name: "Science & Humanities", url: "https://staff.pes.edu/ec/atoz/science-&-humanities/" },
    { name: "Pharmaceutical Sciences", url: "https://staff.pes.edu/ec/atoz/pharmaceutical-sciences/" },
  ],
  "RR Campus": [
    { name: "Architecture", url: "https://staff.pes.edu/rr/atoz/architecture/" },
    { name: "Biotechnology", url: "https://staff.pes.edu/rr/atoz/biotechnology/" },
    { name: "Civil", url: "https://staff.pes.edu/rr/atoz/civil/" },
    { name: "Computer Science", url: "https://staff.pes.edu/rr/atoz/computer-science/" },
    { name: "Computer Science (AIML)", url: "https://staff.pes.edu/rr/atoz/computer-science-AIML/" },
    { name: "Computer Application", url: "https://staff.pes.edu/rr/atoz/computer-application/" },
    { name: "Design", url: "https://staff.pes.edu/rr/atoz/design/" },
    { name: "Electrical & Electronics", url: "https://staff.pes.edu/rr/atoz/electrical-&-electronics/" },
    { name: "Electronics & Communications", url: "https://staff.pes.edu/rr/atoz/electronics-&-communications/" },
    { name: "Law", url: "https://staff.pes.edu/rr/atoz/law/" },
    { name: "Mechanical", url: "https://staff.pes.edu/rr/atoz/mechanical/" },
    { name: "Science & Humanities", url: "https://staff.pes.edu/rr/atoz/science-&-humanities/" },
    { name: "Commerce", url: "https://staff.pes.edu/rr/atoz/commerce/" },
    { name: "Psychology", url: "https://staff.pes.edu/rr/atoz/psychology/" },
  ]
};

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(Object.keys(CAMPUS_DATA)[0]);
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/login");
    } else {
      setMounted(true);
    }
  }, [router]);

  const handleCampusChange = (e) => {
    setSelectedCampus(e.target.value);
    setSelectedDeptIndex(0); // Reset department index when campus changes
  };

  const handleScrape = async () => {
    const department = CAMPUS_DATA[selectedCampus][selectedDeptIndex];
    
    setLoading(true);
    setMessage("Scraping in progress... this may take a few seconds.");

    try {
      const { API_BASE } = require("../../lib/api");
      const response = await fetch(`${API_BASE}/api/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          url: department.url,
          department: department.name,
          campus: selectedCampus,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage(`✅ Success! Found ${data.totalFound} and processed ${data.processed} professors in ${department.name} (${selectedCampus}).`);
      } else {
        setMessage(`❌ Error: ${data.error || "Something went wrong during scraping."}`);
      }
    } catch (error) {
      setMessage(`❌ Network Error: Could not connect to the backend server. Make sure it's running.`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Control Panel</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Professor Scraper Setup</h2>
        <p className="text-gray-500 mb-6">Select a campus and department to automatically fetch and add professors to the database.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
            <select 
              value={selectedCampus} 
              onChange={handleCampusChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.keys(CAMPUS_DATA).map((campus) => (
                <option key={campus} value={campus}>{campus}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select 
              value={selectedDeptIndex} 
              onChange={(e) => setSelectedDeptIndex(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {CAMPUS_DATA[selectedCampus].map((dept, index) => (
                <option key={index} value={index}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-6">
          <button 
            onClick={handleScrape} 
            disabled={loading}
            className={`px-6 py-2 rounded-md font-medium text-white transition-colors
              ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
          >
            {loading ? 'Processing...' : 'Run Scraper'}
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`mt-6 p-4 rounded-md border ${message.includes('❌') ? 'bg-red-50 border-red-200 text-red-700' : message.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          <p className="font-medium whitespace-pre-wrap">{message}</p>
        </div>
      )}
    </div>
  );
}
