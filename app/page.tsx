'use client'

import { useState } from 'react'

export default function Home() {
  const [downloadedWorkflow, setDownloadedWorkflow] = useState(false)

  const youtubeAutomationWorkflow = {
    "name": "YouTube End-to-End Automation",
    "nodes": [
      {
        "parameters": {},
        "id": "d3c63d26-1f9a-4b8e-9c8c-0c8e2f1e5e3b",
        "name": "When clicking 'Execute Workflow'",
        "type": "n8n-nodes-base.manualTrigger",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "operation": "search",
          "resource": "video",
          "q": "={{ $json.searchQuery }}",
          "maxResults": 10,
          "part": "snippet",
          "order": "relevance"
        },
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "YouTube Search",
        "type": "n8n-nodes-base.youTube",
        "typeVersion": 1,
        "position": [450, 300],
        "credentials": {
          "youTubeOAuth2Api": {
            "id": "1",
            "name": "YouTube account"
          }
        }
      },
      {
        "parameters": {
          "functionCode": "const items = $input.all();\nconst videos = [];\n\nfor (const item of items) {\n  if (item.json.id && item.json.id.videoId) {\n    videos.push({\n      videoId: item.json.id.videoId,\n      title: item.json.snippet.title,\n      description: item.json.snippet.description,\n      channelTitle: item.json.snippet.channelTitle,\n      publishedAt: item.json.snippet.publishedAt,\n      thumbnail: item.json.snippet.thumbnails.high.url\n    });\n  }\n}\n\nreturn videos.map(video => ({ json: video }));"
        },
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": "Process Video Data",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [650, 300]
      },
      {
        "parameters": {
          "operation": "getDetails",
          "resource": "video",
          "videoId": "={{ $json.videoId }}",
          "part": "statistics,contentDetails"
        },
        "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "name": "Get Video Statistics",
        "type": "n8n-nodes-base.youTube",
        "typeVersion": 1,
        "position": [850, 300],
        "credentials": {
          "youTubeOAuth2Api": {
            "id": "1",
            "name": "YouTube account"
          }
        }
      },
      {
        "parameters": {
          "functionCode": "const item = $input.item.json;\nconst statistics = $input.item.json.statistics || {};\n\nreturn [{\n  json: {\n    videoId: item.videoId,\n    title: item.title,\n    description: item.description,\n    channelTitle: item.channelTitle,\n    publishedAt: item.publishedAt,\n    thumbnail: item.thumbnail,\n    viewCount: statistics.viewCount || 0,\n    likeCount: statistics.likeCount || 0,\n    commentCount: statistics.commentCount || 0,\n    duration: item.contentDetails?.duration || 'N/A',\n    engagementRate: statistics.viewCount > 0 ? \n      ((parseInt(statistics.likeCount || 0) + parseInt(statistics.commentCount || 0)) / parseInt(statistics.viewCount)) * 100 : 0\n  }\n}];"
        },
        "id": "d4e5f6a7-b8c9-0123-def0-123456789013",
        "name": "Calculate Engagement",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1050, 300]
      },
      {
        "parameters": {
          "conditions": {
            "number": [
              {
                "value1": "={{ $json.engagementRate }}",
                "operation": "larger",
                "value2": 2
              },
              {
                "value1": "={{ $json.viewCount }}",
                "operation": "larger",
                "value2": 1000
              }
            ]
          },
          "combineOperation": "all"
        },
        "id": "e5f6a7b8-c9d0-1234-ef01-234567890124",
        "name": "Filter High Engagement",
        "type": "n8n-nodes-base.if",
        "typeVersion": 1,
        "position": [1250, 300]
      },
      {
        "parameters": {
          "operation": "getAll",
          "resource": "comment",
          "videoId": "={{ $json.videoId }}",
          "maxResults": 20,
          "part": "snippet"
        },
        "id": "f6a7b8c9-d0e1-2345-f012-345678901235",
        "name": "Get Video Comments",
        "type": "n8n-nodes-base.youTube",
        "typeVersion": 1,
        "position": [1450, 200],
        "credentials": {
          "youTubeOAuth2Api": {
            "id": "1",
            "name": "YouTube account"
          }
        }
      },
      {
        "parameters": {
          "functionCode": "const comments = $input.all();\nconst sentimentAnalysis = {\n  positive: 0,\n  negative: 0,\n  neutral: 0,\n  topComments: []\n};\n\nconst positiveWords = ['love', 'great', 'awesome', 'amazing', 'excellent', 'perfect', 'wonderful', 'fantastic'];\nconst negativeWords = ['hate', 'bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'disappointing'];\n\nfor (const comment of comments) {\n  const text = comment.json.snippet?.topLevelComment?.snippet?.textDisplay?.toLowerCase() || '';\n  const likeCount = comment.json.snippet?.topLevelComment?.snippet?.likeCount || 0;\n  \n  let sentiment = 'neutral';\n  \n  if (positiveWords.some(word => text.includes(word))) {\n    sentiment = 'positive';\n    sentimentAnalysis.positive++;\n  } else if (negativeWords.some(word => text.includes(word))) {\n    sentiment = 'negative';\n    sentimentAnalysis.negative++;\n  } else {\n    sentimentAnalysis.neutral++;\n  }\n  \n  if (likeCount > 5) {\n    sentimentAnalysis.topComments.push({\n      text: text.substring(0, 100),\n      likes: likeCount,\n      sentiment: sentiment\n    });\n  }\n}\n\nsentimentAnalysis.topComments.sort((a, b) => b.likes - a.likes).slice(0, 5);\n\nreturn [{ json: sentimentAnalysis }];"
        },
        "id": "a7b8c9d0-e1f2-3456-0123-456789012346",
        "name": "Analyze Comment Sentiment",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [1650, 200]
      },
      {
        "parameters": {
          "resource": "sheet",
          "operation": "append",
          "sheetId": {
            "__rl": true,
            "value": "={{ $('Manual Trigger').item.json.spreadsheetId }}",
            "mode": "id"
          },
          "columns": {
            "mappingMode": "defineBelow",
            "value": {
              "videoId": "={{ $json.videoId }}",
              "title": "={{ $json.title }}",
              "channelTitle": "={{ $json.channelTitle }}",
              "publishedAt": "={{ $json.publishedAt }}",
              "viewCount": "={{ $json.viewCount }}",
              "likeCount": "={{ $json.likeCount }}",
              "commentCount": "={{ $json.commentCount }}",
              "engagementRate": "={{ $json.engagementRate }}",
              "duration": "={{ $json.duration }}",
              "thumbnail": "={{ $json.thumbnail }}"
            }
          }
        },
        "id": "b8c9d0e1-f2a3-4567-1234-567890123457",
        "name": "Save to Google Sheets",
        "type": "n8n-nodes-base.googleSheets",
        "typeVersion": 4,
        "position": [1450, 400],
        "credentials": {
          "googleSheetsOAuth2Api": {
            "id": "2",
            "name": "Google Sheets account"
          }
        }
      },
      {
        "parameters": {
          "content": "=<strong>Video Analysis Complete!</strong>\n\n📊 <strong>Video:</strong> {{ $json.title }}\n📺 <strong>Channel:</strong> {{ $json.channelTitle }}\n👁️ <strong>Views:</strong> {{ $json.viewCount }}\n👍 <strong>Likes:</strong> {{ $json.likeCount }}\n💬 <strong>Comments:</strong> {{ $json.commentCount }}\n📈 <strong>Engagement Rate:</strong> {{ $json.engagementRate.toFixed(2) }}%\n⏱️ <strong>Duration:</strong> {{ $json.duration }}\n\n🔗 <strong>Link:</strong> https://youtube.com/watch?v={{ $json.videoId }}",
          "channel": "#youtube-analytics",
          "sendAsUser": "false"
        },
        "id": "c9d0e1f2-a3b4-5678-2345-678901234568",
        "name": "Send Slack Notification",
        "type": "n8n-nodes-base.slack",
        "typeVersion": 2.1,
        "position": [1650, 400],
        "credentials": {
          "slackApi": {
            "id": "3",
            "name": "Slack account"
          }
        }
      },
      {
        "parameters": {
          "authentication": "oAuth2",
          "text": "=🎥 New High-Engagement Video Alert!\n\n📹 {{ $json.title }}\n👤 {{ $json.channelTitle }}\n\n📊 Stats:\n• Views: {{ $json.viewCount }}\n• Likes: {{ $json.likeCount }}\n• Comments: {{ $json.commentCount }}\n• Engagement: {{ $json.engagementRate.toFixed(2) }}%\n\n🔗 Watch: https://youtube.com/watch?v={{ $json.videoId }}\n\n#YouTubeAutomation #ContentAnalytics"
        },
        "id": "d0e1f2a3-b4c5-6789-3456-789012345679",
        "name": "Post to Twitter",
        "type": "n8n-nodes-base.twitter",
        "typeVersion": 2,
        "position": [1850, 300],
        "credentials": {
          "twitterOAuth2Api": {
            "id": "4",
            "name": "Twitter account"
          }
        }
      },
      {
        "parameters": {
          "resource": "message",
          "operation": "send",
          "channel": "={{ $('Manual Trigger').item.json.discordChannelId }}",
          "content": "=📊 **YouTube Video Analysis Report**\n\n**Video:** {{ $json.title }}\n**Channel:** {{ $json.channelTitle }}\n**Published:** {{ $json.publishedAt }}\n\n**Performance Metrics:**\n👁️ Views: {{ $json.viewCount }}\n👍 Likes: {{ $json.likeCount }}\n💬 Comments: {{ $json.commentCount }}\n📈 Engagement Rate: {{ $json.engagementRate.toFixed(2) }}%\n⏱️ Duration: {{ $json.duration }}\n\n🔗 [Watch Video](https://youtube.com/watch?v={{ $json.videoId }})"
        },
        "id": "e1f2a3b4-c5d6-7890-4567-890123456780",
        "name": "Send Discord Alert",
        "type": "n8n-nodes-base.discord",
        "typeVersion": 2,
        "position": [2050, 300],
        "credentials": {
          "discordApi": {
            "id": "5",
            "name": "Discord account"
          }
        }
      },
      {
        "parameters": {
          "method": "POST",
          "url": "={{ $('Manual Trigger').item.json.webhookUrl }}",
          "authentication": "genericCredentialType",
          "options": {},
          "bodyParameters": {
            "parameters": [
              {
                "name": "videoId",
                "value": "={{ $json.videoId }}"
              },
              {
                "name": "title",
                "value": "={{ $json.title }}"
              },
              {
                "name": "stats",
                "value": "={{ JSON.stringify({ views: $json.viewCount, likes: $json.likeCount, comments: $json.commentCount, engagement: $json.engagementRate }) }}"
              }
            ]
          }
        },
        "id": "f2a3b4c5-d6e7-8901-5678-901234567891",
        "name": "Send Webhook",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.1,
        "position": [1850, 500]
      }
    ],
    "connections": {
      "When clicking 'Execute Workflow'": {
        "main": [
          [
            {
              "node": "YouTube Search",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "YouTube Search": {
        "main": [
          [
            {
              "node": "Process Video Data",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Process Video Data": {
        "main": [
          [
            {
              "node": "Get Video Statistics",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Get Video Statistics": {
        "main": [
          [
            {
              "node": "Calculate Engagement",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Calculate Engagement": {
        "main": [
          [
            {
              "node": "Filter High Engagement",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Filter High Engagement": {
        "main": [
          [
            {
              "node": "Get Video Comments",
              "type": "main",
              "index": 0
            },
            {
              "node": "Save to Google Sheets",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Get Video Comments": {
        "main": [
          [
            {
              "node": "Analyze Comment Sentiment",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Save to Google Sheets": {
        "main": [
          [
            {
              "node": "Send Slack Notification",
              "type": "main",
              "index": 0
            },
            {
              "node": "Send Webhook",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Send Slack Notification": {
        "main": [
          [
            {
              "node": "Post to Twitter",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Post to Twitter": {
        "main": [
          [
            {
              "node": "Send Discord Alert",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {
      "executionOrder": "v1"
    },
    "staticData": null,
    "tags": [],
    "triggerCount": 1,
    "updatedAt": "2025-11-06T00:00:00.000Z",
    "versionId": "1"
  }

  const downloadJSON = () => {
    const dataStr = JSON.stringify(youtubeAutomationWorkflow, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'youtube-automation-workflow.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setDownloadedWorkflow(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(youtubeAutomationWorkflow, null, 2))
    alert('Workflow JSON copied to clipboard!')
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎬 YouTube End-to-End Automation
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Complete n8n Workflow for YouTube Analytics & Distribution
          </p>
          <div className="inline-block bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Ready to Import into n8n
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">✨ Workflow Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">🔍 Video Discovery</h3>
              <p className="text-gray-300 text-sm">Search and retrieve YouTube videos based on custom queries</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">📊 Analytics Processing</h3>
              <p className="text-gray-300 text-sm">Extract statistics, calculate engagement rates, and analyze performance</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">🎯 Smart Filtering</h3>
              <p className="text-gray-300 text-sm">Filter high-engagement videos based on custom thresholds</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">💬 Comment Analysis</h3>
              <p className="text-gray-300 text-sm">Retrieve and analyze video comments with sentiment detection</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">📝 Google Sheets Integration</h3>
              <p className="text-gray-300 text-sm">Automatically save video data to spreadsheets</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-white mb-2">🔔 Multi-Platform Alerts</h3>
              <p className="text-gray-300 text-sm">Send notifications to Slack, Discord, Twitter, and webhooks</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={downloadJSON}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              📥 Download Workflow JSON
            </button>
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              📋 Copy to Clipboard
            </button>
          </div>

          {downloadedWorkflow && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-center">
              ✅ Workflow downloaded successfully! Import it into n8n to get started.
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 How to Use</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
              <span>Download the workflow JSON file using the button above</span>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
              <span>Open your n8n instance and go to Workflows</span>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
              <span>Click "Import from File" and select the downloaded JSON</span>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
              <span>Configure your credentials (YouTube, Google Sheets, Slack, Twitter, Discord)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">5</span>
              <span>Set your search query and other parameters in the manual trigger node</span>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">6</span>
              <span>Execute the workflow and watch the automation magic happen!</span>
            </li>
          </ol>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">📋 Workflow Structure</h2>
          <div className="space-y-2 text-gray-300 font-mono text-sm overflow-x-auto">
            <div className="whitespace-pre">
{`Manual Trigger
    ↓
YouTube Search (find videos)
    ↓
Process Video Data (extract metadata)
    ↓
Get Video Statistics (views, likes, comments)
    ↓
Calculate Engagement (engagement rate formula)
    ↓
Filter High Engagement (>2% engagement, >1000 views)
    ├─→ Get Video Comments
    │       ↓
    │   Analyze Comment Sentiment (positive/negative/neutral)
    │
    └─→ Save to Google Sheets
            ↓
        Send Slack Notification
            ↓
        Post to Twitter
            ↓
        Send Discord Alert

        (Also) Send Webhook`}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Built with ❤️ for n8n automation • Total Nodes: 13 • Ready to Deploy
          </p>
        </div>
      </div>
    </main>
  )
}
