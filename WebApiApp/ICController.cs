using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Windows.Forms;
using System.Timers;

namespace OwinSelfhostSample
{
    public class ICController : ApiController
    {

        [DllImport("user32.dll", EntryPoint = "FindWindow")]
        public extern static IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", EntryPoint = "GetForegroundWindow", CharSet = System.Runtime.InteropServices.CharSet.Auto, ExactSpelling = true)]
        public static extern IntPtr GetF(); //获得本窗体的句柄

        [DllImport("user32.dll", EntryPoint = "SetForegroundWindow")]
        public static extern bool SetF(IntPtr hWnd); //设置此窗体为活动窗体

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern int SetWindowPos(IntPtr hWnd, int hWndInsertAfter, int x,int y, int Width, int Height, int flags);

        [DllImport("ICCInter_HZ.dll")]
        private extern static int ICC_Transaction(int TransNum, string DataIn, [Out]char[] DataOut);

        [DllImport("HZSiInterface.dll")]
        private extern static int INIT([Out]char[] pErrMsg);
        [DllImport("HZSiInterface.dll")]
        private extern static int BUSINESS_HANDLE(string inputData,[Out]char[] outputData);

        private System.Timers.Timer timer;

        public ICController()
        {
            this.timer = new System.Timers.Timer();
            this.timer.Interval = 200D;
            this.timer.Elapsed += new System.Timers.ElapsedEventHandler(this.setFocus);
        }

        // 杭州医保读卡
        [HttpGet]
        public HttpResponseMessage ReadCard(int TransNum,string DataIn)
        {
            
            this.timer.Start();
            HttpResponseMessage responseMessage = new HttpResponseMessage();
            if (DataIn == null) {
                DataIn = "";
            }
            try
            {
                char[] dataOut = new char[20000];
                int a = ICC_Transaction(TransNum, DataIn, dataOut);
                string b = new string(dataOut);
                string c = b.Replace("\0", "");

                if (a == 0)
                {
                    responseMessage.Content = new StringContent(c, Encoding.GetEncoding("UTF-8"), "text/plain");
                }
                else
                {
                    responseMessage.Content = new StringContent(a + "|" + c, Encoding.GetEncoding("UTF-8"), "text/plain");
                }


            }
            catch (Exception ex)
            {
                responseMessage.Content = new StringContent(ex.Message, Encoding.GetEncoding("UTF-8"), "text/plain");
            }
            finally {
                this.timer.Stop();
            }

            return responseMessage;
        }

        //杭州医保初始化
        [HttpGet]
        public HttpResponseMessage Init()
        {

            this.timer.Start();
            HttpResponseMessage responseMessage = new HttpResponseMessage();
            
            try
            {
                char[] dataOut = new char[20000];
                int a = INIT(dataOut);
                string b = new string(dataOut);
                string c = b.Replace("\0", "");

                responseMessage.Content = new StringContent(a + "|" + c, Encoding.GetEncoding("UTF-8"), "text/plain");


            }
            catch (Exception ex)
            {
                responseMessage.Content = new StringContent(ex.Message, Encoding.GetEncoding("UTF-8"), "text/plain");
            }
            finally
            {
                this.timer.Stop();
            }

            return responseMessage;
        }

        //杭州医保初始化
        [HttpGet]
        public HttpResponseMessage Business_handle(string inputStr)
        {

            this.timer.Start();
            HttpResponseMessage responseMessage = new HttpResponseMessage();

            try
            {
                char[] dataOut = new char[20000];
                int a = BUSINESS_HANDLE(inputStr,dataOut);
                string b = new string(dataOut);
                string c = b.Replace("\0", "");

                responseMessage.Content = new StringContent(a + "|" + c, Encoding.GetEncoding("UTF-8"), "text/plain");


            }
            catch (Exception ex)
            {
                responseMessage.Content = new StringContent(ex.Message, Encoding.GetEncoding("UTF-8"), "text/plain");
            }
            finally
            {
                this.timer.Stop();
            }

            return responseMessage;
        }

        private void setFocus(object sender, EventArgs e)
        {
            IntPtr a = FindWindow(null, "读市民卡错误提示:");
            if (a != IntPtr.Zero && a != GetF())
            {
                SetWindowPos(a, -1, 0, 0, 0, 0, 1 | 2);
                //ShowWindow(a, 9);
                SetF(a);
            }
            IntPtr b = FindWindow(null, "提示:");
            if (b != IntPtr.Zero && b != GetF())
            {
                SetWindowPos(b, -1, 0, 0, 0, 0, 1 | 2);
                //ShowWindow(b, 9);
                SetF(b);
            }

        }

    }
}