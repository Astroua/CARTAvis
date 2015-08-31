import unittest
import time
import selectBrowser
import Util
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By

# Tests of histogram functionality
class tHistogram( unittest.TestCase ):

    def setUp(self):
        browser = selectBrowser._getBrowser()
        Util.setUp( self, browser )

    def _getTextValue(self, driver, id):
        textField = driver.find_element_by_id(id)
        textValue = textField.get_attribute("value")
        return textValue

    # Open histogram settings by clicking on the Histogram settings checkbox located on the menu bar
    def _openHistogramSettings(self, driver):
        histogramSettingsCheckbox = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.form.CheckBox']/div[text()='Histogram Settings']")))
        ActionChains(driver).click( histogramSettingsCheckbox ).perform()

    # Find the histogram window either as an inline display if it is already present or as a popup
    def _getHistogramWindow(self, driver):
        # First see if there is a histogram window already there
        histWindow = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowHistogram']")))

        if histWindow is None:
            print "Making popup histogram"
            #Find a window capable of loading an image 
            imageWindow = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))
            if imageWindow is None:
                print "No way to get a histogram window"
                return

            # Show the context menu 
            ActionChains(driver).context_click( imageWindow ).perform()

            # Click the popup button 
            popupButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[text()='Popup']/..")))
            self.assertIsNotNone( popupButton, "Could not click popup button in the context menu")
            ActionChains(driver).click( popupButton ).perform()

            # Look for the histogram button and click it to open the histogram dialog
            histogramButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div/div[text()='Histogram']/..")))
            self.assertIsNotNone( histogramButton, "Could not click histogram button on popup subcontext menu")
            ActionChains(driver).click( histogramButton ).perform()

            # We should now see a histogram popup window 
            histWindow = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowHistogram']")))
            self.assertIsNotNone( histWindow, "Could not popup a histogram")

        return histWindow

    # Test that if we set the value in the bin count text field, the slider updates 
    # its value accordingly
    def test_binCountChange(self):
        driver = self.driver
        timeout = selectBrowser._getSleep()

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Find and select the histogram window 
        histWindow = self._getHistogramWindow( driver )
        ActionChains(driver).click( histWindow )

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )

        # Navigate to Display tab of the Histogram Settings
        displayTab = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.tabview.TabButton']/div[contains(text(),'Display')]/..")))
        driver.execute_script( "arguments[0].scrollIntoView(true);", displayTab)
        ActionChains(driver).click( displayTab ).perform()

        # Look for the binCountText field.
        binCountText = driver.find_element_by_xpath( "//input[starts-with(@id,'histogramBinCountTextField')]" )
        # Scroll the histogram window so the bin count at the bottom is visible.
        driver.execute_script( "arguments[0].scrollIntoView(true);", binCountText)
        textValue = binCountText.get_attribute("value")
        print "value of text field=", textValue
        
        # Calculate percent difference from center.  Note this will fail if the upper
        # bound of the slider changes.
        textScrollPercent = (500 - int(float(textValue))) / 1000.0
        print "scrollPercent=",textScrollPercent
       
        # Look for the bin count slider.
        binCountSlider = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[starts-with(@id, 'histogramBinCountSlider')]")))
        # Width of the slider
        sliderSize = binCountSlider.size
        # Amount we need to move in order to get to the center
        sliderScrollAmount = sliderSize['width'] * textScrollPercent
        print 'Slider scroll=',sliderScrollAmount
        
        # Look for the scroll bar in the slider and get its size
        sliderScroll = binCountSlider.find_element_by_xpath( ".//div")
        self.assertIsNotNone( sliderScroll, "Could not find bin count slider scroll")
        scrollSize = sliderScroll.size
        print 'Scroll width=', scrollSize['width']
        
        # Subtract half the width of the slider scroll.
        sliderScrollAmount = sliderScrollAmount - scrollSize['width'] / 2
        print 'Slider scroll adjusted=',sliderScrollAmount
        ActionChains( driver ).drag_and_drop_by_offset( sliderScroll, sliderScrollAmount, 0 ).perform()
        time.sleep( timeout )

        # Check that the value goes to the server and gets set in the text field.
        newText = binCountText.get_attribute( "value")
        print 'Text=',newText
        self.assertAlmostEqual( int(float(newText)), 5000 ,None,"Failed to scroll halfway",250)

    
    # Test that the Histogram min and max zoom value 
    def test_zoom(self):
        driver = self.driver
        timeout = selectBrowser._getSleep()
        
        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Load an image
        Util.load_image(self, driver, "Default")
        
        #Find and select the histogram window
        histWindow = self._getHistogramWindow( driver )
        ActionChains( driver).click( histWindow ).perform()
        
        # Click the settings button to expose the settings.
        self._openHistogramSettings( driver )
        
        # Look for the min and max zoom values and store their values.
        minZoomValue = self._getTextValue( driver, "histogramZoomMinValue")
        print "Min zoom=", minZoomValue
        maxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        print "Max zoom=", maxZoomValue
        
        # Find the min and max zoom percentages.  Decrease their values.
        minPercentText = driver.find_element_by_id("histogramZoomMinPercent")
        driver.execute_script( "arguments[0].scrollIntoView(true);", minPercentText)
        minZoomPercent = minPercentText.get_attribute( "value")
        maxPercentText = driver.find_element_by_id("histogramZoomMaxPercent")
        maxZoomPercent = maxPercentText.get_attribute( "value")
        driver.execute_script( "arguments[0].scrollIntoView(true);", maxPercentText)
        incrementAmount = 40;
        newMinZoomPercent = Util._changeElementText(self, driver, minPercentText, str(float(minZoomPercent) + incrementAmount))
        newMaxZoomPercent = Util._changeElementText(self, driver, maxPercentText, str(float(maxZoomPercent) - incrementAmount))
        time.sleep( timeout )

        # Get the new min and max zoom values.
        newMinZoomValue = self._getTextValue( driver, "histogramZoomMinValue")
        newMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        
        # Check that the new min is larger than the old min
        print "oldMin=", minZoomValue," newMin=", newMinZoomValue
        self.assertGreater( float(newMinZoomValue), float(minZoomValue), "Min did not increase")
        
        # Check that the new max is smaller than the old max
        print "oldMax=", maxZoomValue, " newMax=",newMaxZoomValue
        self.assertGreater( float(maxZoomValue), float(newMaxZoomValue), "Max did not decrease")

 
    # Test that histogram values will update when an additional image is loaded 
    # in the image window. 
    def test_histogramAddImage(self):
        driver = self.driver 
        timeout = selectBrowser._getSleep()

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Load an image
        Util.load_image(self, driver, "Default")

        # Find and select the histogram
        histWindow = self._getHistogramWindow(driver)
        ActionChains(driver).click( histWindow ).perform()

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )

        # Get the max zoom value of the first image
        maxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        print "First image maxZoomValue:", maxZoomValue

        # Load a different image in the same window 
        Util.load_image(self, driver, "aH.fits")
        time.sleep( timeout )

        # Check that the new max zoom value updates 
        newMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        self.assertNotEqual(float(newMaxZoomValue), float(maxZoomValue), "The histogram did not update when a new image was loaded.")
        print "Second image maxZoomValue:", newMaxZoomValue
    
    # Test that the removal of an image will restore the Histogram to default values
    def test_histogramRemoveImage(self):
        driver = self.driver

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Load an image
        Util.load_image( self, driver, "Default")

        # Click on the Data->Close->Image button to close the image
        imageWindow = driver.find_element_by_xpath( "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")
        ActionChains(driver).double_click( imageWindow ).perform()
        dataButton = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[text()='Data']/..")))
        ActionChains(driver).click( dataButton ).send_keys(Keys.ARROW_DOWN).send_keys(Keys.ARROW_DOWN).send_keys(
            Keys.ARROW_RIGHT).send_keys(Keys.ENTER).perform()

        # Find and select the Histogram window
        histWindow = self._getHistogramWindow( driver )
        ActionChains(driver).click( histWindow )

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )

        # Check that the histogram values are restored to default values
        newMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        print "Zoom max value=", newMaxZoomValue
        self.assertEqual( float(newMaxZoomValue), 1, "Default values were not restored after image removal")

    # Test that the histogram updates its values when the image is changed in the image window. 
    def test_histogramChangeImage(self):
        driver = self.driver 
        timeout = selectBrowser._getSleep()

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Load two images in the same image window
        Util.load_image( self, driver, "Default")
        Util.load_image( self, driver, "aH.fits")

        # Find and select the histogram
        histWindow = self._getHistogramWindow( driver )
        ActionChains(driver).click( histWindow ).perform()

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )
        time.sleep( timeout )

        # Record the Histogram max zoom value of the second image 
        secondMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue" )
        print "Second image maxZoomValue:", secondMaxZoomValue

        # Find and click on the animation window 
        animWindow = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowAnimation']")))
        ActionChains(driver).click( animWindow ).perform()   

        # Make sure the animation window is enabled by clicking an element within the window
        # From the context menu, uncheck the Channel Animator and check the Image Animator
        channelText = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "ChannelIndexText")))
        ActionChains(driver).click( channelText ).perform()
        animateToolBar = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.toolbar.MenuButton']/div[text()='Animate']")))
        ActionChains(driver).click( animateToolBar ).send_keys(Keys.ARROW_DOWN).send_keys(Keys.ARROW_DOWN).send_keys(
            Keys.ENTER).perform()
        time.sleep(timeout)

        # Find the first value button and click the button
        firstValueButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "ImageTapeDeckFirstValue")))
        driver.execute_script( "arguments[0].scrollIntoView(true);", firstValueButton)
        ActionChains(driver).click( firstValueButton ).perform()
        time.sleep( timeout )

        # Record the Histogram max zoom value of the first image
        firstMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue" )
        print "First image maxZoomValue:", firstMaxZoomValue

        # Check that the Histogram updates its values
        self.assertNotEqual( float(firstMaxZoomValue), float(secondMaxZoomValue), "Histogram did not update when the image was switched in the image window.")

    # Test that the histogram is only able to link to one image. We first load
    # an image in the image window. This image should be linked to the histogram window.
    # We then open a different image in a separate window and try to link the 
    # histogram to the second image. This should fail, and the histogram values should not change. 
    def test_histogramLinking(self):
        driver = self.driver 
        timeout = selectBrowser._getSleep()

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Load an image
        Util.load_image( self, driver, "Default")

        # Load the second image in a separate window
        imageWindow2 = Util.load_image_different_window( self, driver, "aH.fits")

        # Find and select the histogram
        histWindow = self._getHistogramWindow( driver )
        ActionChains(driver).click( histWindow ).perform()

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )

        # Record the max zoom value of the first image
        maxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue" )
        print "First image maxZoomValue:", maxZoomValue
        time.sleep( timeout )

        # Open link settings for the histogram
        linkMenuButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.toolbar.MenuButton']/div[text()='Links...']")))
        ActionChains.click( linkMenuButton ).perform()
        time.sleep( timeout )

        # Try to add a link from the Histogram to the second image
        # This should fail: no link should be made from the Histogram to the second image
        Util.link_second_image( self, driver, imageWindow2 )

        # Check that the second image is not linked to the Histogram
        # Check that the max zoom value did not change from the linking attempt to the second image
        newMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        print "New maxZoomValue:", newMaxZoomValue
        self.assertEqual( float( maxZoomValue ), float( newMaxZoomValue), "Histogram should not link to second image.")

    # Test removal of a link from the Histogram.
    def test_histogramLinkRemoval(self):
        driver = self.driver
        browser = selectBrowser._getBrowser()

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Find the Histogram window 
        histWindow = self._getHistogramWindow( driver )
        
        # Open Link settings for the Histogram window
        linkMenuButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.toolbar.MenuButton']/div[text()='Links...']")))
        ActionChains.click( linkMenuButton ).perform()

        # Remove link from the Histogram to the main image window
        Util.remove_main_link( self, driver, imageWindow )

        # Load an image
        Util.load_image( self, driver, "Default")

        # Find and select the histogram window
        histWindow = self._getHistogramWindow( driver )
        ActionChains(driver).click( histWindow ).perform()

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )

        # Check that the histogram values are default values
        newMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        self.assertEqual( float(newMaxZoomValue), 1, "Histogram is linked to image after link was removed")

    # Test that we can change the linked image to the Histogram
    def test_histogramChangeLinks(self):
        driver = self.driver 
        browser = selectBrowser._getBrowser()

        # Wait for the image window to be present (ensures browser is fully loaded)
        imageWindow = WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='skel.widgets.Window.DisplayWindowImage']")))

        # Find and select the Histogram window
        histWindow = self._getHistogramWindow( driver )
        ActionChains(driver).click( histWindow ).perform()

        # Click the settings button to expose the settings
        self._openHistogramSettings( driver )

         # Open Link settings for the Histogram window
        linkMenuButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.toolbar.MenuButton']/div[text()='Links...']")))
        ActionChains.click( linkMenuButton ).perform()

        # Remove the link from the Histogram to the main image window
        Util.remove_main_link( self, driver, imageWindow )

        # Load an image in a separate window
        imageWindow2 = Util.load_image_different_window( self, driver, "aH.fits")

        # Open link settings for the Histogram 
        ActionChains(driver).click( histWindow ).perform()
        linkMenuButton = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//div[@qxclass='qx.ui.toolbar.MenuButton']/div[text()='Links...']")))
        ActionChains.click( linkMenuButton ).perform()

        # Link the Histogram to the second image
        Util.link_second_image( self, driver, imageWindow2)

        # Check that the histogram values are not default values
        newMaxZoomValue = self._getTextValue( driver, "histogramZoomMaxValue")
        self.assertNotEqual( float(newMaxZoomValue), 1, "Histogram did not update to newly linked image")

    def tearDown(self):
        # Close the browser
        self.driver.close()
        # Allow browser to fully close before continuing
        time.sleep(2)
        # Close the session and delete temporary files
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()      
        
