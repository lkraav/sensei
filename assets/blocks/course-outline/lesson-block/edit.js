import { createBlock } from '@wordpress/blocks';
import { select, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { withColorSettings } from '../../../shared/blocks/settings';
import SingleLineInput from '../single-line-input';
import { LessonBlockSettings } from './settings';
import { Status } from '../status-control';
import { ENTER, BACKSPACE } from '@wordpress/keycodes';

/**
 * Edit lesson block component.
 *
 * @param {Object}   props                     Component props.
 * @param {string}   props.clientId            Block client ID.
 * @param {string}   props.name                Block name.
 * @param {string}   props.className           Custom class name.
 * @param {Object}   props.attributes          Block attributes.
 * @param {string}   props.attributes.title    Lesson title.
 * @param {number}   props.attributes.id       Lesson Post ID
 * @param {number}   props.attributes.fontSize Lesson title font size.
 * @param {boolean}  props.attributes.draft    Draft status of lesson.
 * @param {Object}   props.backgroundColor     Background color object.
 * @param {Object}   props.textColor           Text color object.
 * @param {Function} props.setAttributes       Block set attributes function.
 * @param {Function} props.insertBlocksAfter   Insert blocks after function.
 * @param {boolean}  props.isSelected          Is block selected.
 */
export const EditLessonBlock = ( props ) => {
	const {
		clientId,
		name,
		className,
		attributes: { title, id, fontSize, draft },
		backgroundColor,
		textColor,
		setAttributes,
		insertBlocksAfter,
		isSelected,
	} = props;
	const { selectNextBlock, removeBlock } = useDispatch( 'core/block-editor' );

	/**
	 * Update lesson title.
	 *
	 * @param {string} value Lesson title.
	 */
	const updateTitle = ( value ) => {
		setAttributes( { title: value } );
	};

	/**
	 * Insert a new lesson on enter, unless there is already an empty new lesson after this one.
	 */
	const onEnter = () => {
		const editor = select( 'core/block-editor' );
		const nextBlock = editor.getBlock( editor.getNextBlockClientId() );

		if ( ! nextBlock || nextBlock.attributes.title ) {
			insertBlocksAfter( [ createBlock( name ) ] );
		} else {
			selectNextBlock( clientId );
		}
	};

	/**
	 * Remove lesson on backspace.
	 *
	 * @param {Object}   e                Event object.
	 * @param {Function} e.preventDefault Prevent default function.
	 */
	const onBackspace = ( e ) => {
		if ( 0 === title.length ) {
			e.preventDefault();
			removeBlock( clientId );
		}
	};

	/**
	 * Handle key down.
	 *
	 * @param {Object} e         Event object.
	 * @param {number} e.keyCode Pressed key code.
	 */
	const handleKeyDown = ( e ) => {
		switch ( e.keyCode ) {
			case ENTER:
				onEnter();
				break;
			case BACKSPACE:
				onBackspace( e );
				break;
		}
	};

	let status = '';
	if ( ! id && title.length ) {
		status = (
			<div className="wp-block-sensei-lms-course-outline-lesson__unsaved">
				{ __( 'Unsaved', 'sensei-lms' ) }
			</div>
		);
	} else if ( id && draft ) {
		status = (
			<div className="wp-block-sensei-lms-course-outline-lesson__draft">
				{ __( 'Draft', 'sensei-lms' ) }
			</div>
		);
	}

	const [ previewStatus, setPreviewStatus ] = useState( Status.IN_PROGRESS );

	const wrapperStyles = {
		className: classnames(
			className,
			backgroundColor?.class,
			textColor?.class,
			{
				completed: previewStatus === Status.COMPLETED,
			}
		),
		style: {
			backgroundColor: backgroundColor?.color,
			color: textColor?.color,
		},
	};

	return (
		<>
			<LessonBlockSettings
				{ ...props }
				previewStatus={ previewStatus }
				setPreviewStatus={ setPreviewStatus }
			/>
			<div { ...wrapperStyles }>
				<SingleLineInput
					className="wp-block-sensei-lms-course-outline-lesson__input"
					placeholder={ __( 'Lesson name', 'sensei-lms' ) }
					value={ title }
					onChange={ updateTitle }
					onKeyDown={ handleKeyDown }
					style={ { fontSize } }
				/>
				{ isSelected && status }
			</div>
		</>
	);
};

export default withColorSettings( {
	backgroundColor: {
		style: 'background-color',
		label: __( 'Background color', 'sensei-lms' ),
	},
	textColor: {
		style: 'color',
		label: __( 'Text color', 'sensei-lms' ),
	},
} )( EditLessonBlock );
