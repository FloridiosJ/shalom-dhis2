import React, {
  forwardRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  useRef,
} from 'react';
import {StyleSheet, Platform} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export interface BottomSheetWrapperRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetWrapperProps {
  children: React.ReactNode;
  snapPoints?: string[];
  enableDynamicSizing?: boolean;
  onClose?: () => void;
  enablePanDownToClose?: boolean;
  keyboardBehavior?: 'interactive' | 'fillParent' | 'extend';
}

const BottomSheetWrapper = forwardRef<
  BottomSheetWrapperRef,
  BottomSheetWrapperProps
>(
  (
    {
      children,
      snapPoints: customSnapPoints,
      enableDynamicSizing = true,
      onClose,
      enablePanDownToClose = true,
      keyboardBehavior = 'interactive',
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Define snap points - use dynamic sizing or custom points
    const snapPoints = useMemo(() => {
      if (enableDynamicSizing && !customSnapPoints) {
        return undefined; // Let dynamic sizing handle it
      }
      return customSnapPoints || ['50%', '75%'];
    }, [customSnapPoints, enableDynamicSizing]);

    // Expose open/close methods via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.expand();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    // Handle sheet changes
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1 && onClose) {
          onClose();
        }
      },
      [onClose],
    );

    // Render backdrop
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <GestureHandlerRootView style={styles.gestureContainer}>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enableDynamicSizing={enableDynamicSizing}
          enablePanDownToClose={enablePanDownToClose}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          keyboardBehavior={keyboardBehavior}
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          style={styles.bottomSheet}>
          <BottomSheetView style={styles.contentContainer}>
            {children}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  },
);

BottomSheetWrapper.displayName = 'BottomSheetWrapper';

const styles = StyleSheet.create({
  gestureContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bottomSheet: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default BottomSheetWrapper;
